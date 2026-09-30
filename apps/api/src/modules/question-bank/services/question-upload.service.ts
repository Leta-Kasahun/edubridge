import crypto from "crypto";
import { DocumentExtractorLib } from "../../../lib/extraction/index.js";
import { QuestionService } from "./question.service.js";
import { QuestionBankRepository } from "../repository/question-bank.repository.js";
import {
  ExtractedDocument,
} from "../types/extraction.types.js";
import {
  QuestionUploadCandidate,
  QuestionOptionDto,
} from "../types/question-bank.types.js";
import {
  NotFoundError,
} from "../../../shared/exceptions/index.js";

interface StagedUpload {
  uploadId: string;
  tenantId: string;
  questionBankId: string;
  filename: string;
  document: ExtractedDocument;
  candidates: QuestionUploadCandidate[];
  createdAt: number;
}

const uploadCache = new Map<string, StagedUpload>();

export class QuestionUploadService {
  constructor(
    private readonly extractor: DocumentExtractorLib = new DocumentExtractorLib(),
    private readonly questionService: QuestionService = new QuestionService(),
    private readonly bankRepository: QuestionBankRepository = new QuestionBankRepository()
  ) {}

  async processUpload(
    tenantId: string,
    questionBankId: string,
    fileBuffer: Buffer,
    mimeType: string,
    filename: string
  ) {
    const bank = await this.bankRepository.findById(tenantId, questionBankId);
    if (!bank) {
      throw new NotFoundError("Question bank not found");
    }

    const document = await this.extractor.extract(fileBuffer, mimeType, filename);
    const candidates = this.parseCandidatesFromDocument(document);
    const uploadId = crypto.randomUUID();

    uploadCache.set(uploadId, {
      uploadId,
      tenantId,
      questionBankId,
      filename,
      document,
      candidates,
      createdAt: Date.now(),
    });

    this.cleanStaleUploads();

    const mappedQuestions = candidates.map((c) => ({
      type: c.type,
      prompt: c.questionText,
      difficulty: c.difficulty,
      defaultPoints: c.points,
      explanation: c.explanation || null,
      options: c.options?.map((o, idx) => ({
        text: o.optionText,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex ?? idx,
      })) || [],
    }));

    return {
      uploadId,
      fileName: filename,
      filename,
      fileSize: fileBuffer.length,
      pageCount: document.pageCount,
      isScanned: document.isScanned,
      questionsExtracted: candidates.length,
      candidateCount: candidates.length,
      extractionStatus: "COMPLETED" as const,
      extractedQuestions: mappedQuestions,
      candidates,
      fullText: document.fullText,
    };
  }

  async getPreview(uploadId: string, tenantId: string) {
    const staged = uploadCache.get(uploadId);
    if (!staged || staged.tenantId !== tenantId) {
      throw new NotFoundError("Upload preview session expired or not found");
    }

    const mappedQuestions = staged.candidates.map((c) => ({
      type: c.type,
      prompt: c.questionText,
      difficulty: c.difficulty,
      defaultPoints: c.points,
      explanation: c.explanation || null,
      options: c.options?.map((o, idx) => ({
        text: o.optionText,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex ?? idx,
      })) || [],
    }));

    return {
      uploadId: staged.uploadId,
      fileName: staged.filename,
      filename: staged.filename,
      pageCount: staged.document.pageCount,
      isScanned: staged.document.isScanned,
      questionsExtracted: staged.candidates.length,
      candidateCount: staged.candidates.length,
      extractionStatus: "COMPLETED" as const,
      extractedQuestions: mappedQuestions,
      candidates: staged.candidates,
      pages: staged.document.pages,
    };
  }

  async confirmUpload(
    tenantId: string,
    questionBankId: string,
    userId: string,
    uploadId: string,
    confirmedQuestionsInput: Array<{
      prompt?: string;
      questionText?: string;
      type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERIC" | "MATCHING" | "ORDERING";
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      defaultPoints?: number;
      points?: number;
      explanation?: string | null;
      options?: Array<{
        optionKey?: string;
        optionText?: string;
        text?: string;
        orderIndex?: number;
        isCorrect?: boolean;
      }>;
      topicId?: string | null;
      objectiveId?: string | null;
    }>
  ) {
    const staged = uploadCache.get(uploadId);
    if (!staged || staged.tenantId !== tenantId) {
      throw new NotFoundError("Upload session expired or not found");
    }

    const questionsToCreate = [];

    for (const q of confirmedQuestionsInput) {
      const questionText = (q.prompt || q.questionText || "").trim();
      if (!questionText) continue;

      const options = (q.options || []).map((opt, idx) => ({
        optionKey: opt.optionKey || String.fromCharCode(65 + idx),
        optionText: (opt.optionText || opt.text || "").trim(),
        orderIndex: opt.orderIndex ?? idx,
        isCorrect: Boolean(opt.isCorrect),
      }));

      questionsToCreate.push({
        type: q.type || "MCQ",
        difficulty: q.difficulty || "MEDIUM",
        questionText,
        explanation: q.explanation || undefined,
        points: q.defaultPoints ?? q.points ?? 1,
        source: "IMPORTED" as const,
        options,
        topicIds: q.topicId ? [{ topicId: q.topicId, isPrimary: true }] : [],
        ...(q.objectiveId && {
          objectiveIds: [{ objectiveId: q.objectiveId }],
        }),
      });
    }

    const createdQuestions = await this.questionService.createBatch(
      tenantId,
      questionBankId,
      userId,
      questionsToCreate
    );

    uploadCache.delete(uploadId);

    return {
      success: true,
      importedCount: createdQuestions.length,
      questions: createdQuestions,
    };
  }

  private parseCandidatesFromDocument(
    document: ExtractedDocument
  ): QuestionUploadCandidate[] {
    const candidates: QuestionUploadCandidate[] = [];

    // Split text by standard question markers (e.g. "1. ", "Question 1:", "Q1.", "1) ")
    const questionChunks = this.splitIntoQuestionChunks(document);

    for (const chunk of questionChunks) {
      const text = chunk.trim();
      if (text.length < 5) continue;

      const { answerKey, explanation } = this.extractAnswerAndExplanation(text);
      const options = this.extractOptionsFromText(text, answerKey);
      const questionStem = this.cleanQuestionStem(text);

      if (!questionStem || questionStem.length < 3) continue;

      let type: QuestionUploadCandidate["type"] = "SHORT_ANSWER";
      if (options.length >= 2) {
        const isTrueFalse =
          options.length === 2 &&
          options.some((o) => /^true$/i.test(o.optionText)) &&
          options.some((o) => /^false$/i.test(o.optionText));
        type = isTrueFalse ? "TRUE_FALSE" : "MCQ";
      }

      candidates.push({
        questionText: questionStem,
        type,
        difficulty: "MEDIUM",
        points: 1,
        explanation: explanation || undefined,
        options,
      });
    }

    return candidates;
  }

  private splitIntoQuestionChunks(document: ExtractedDocument): string[] {
    const fullText = document.fullText || "";
    // If fullText has question numbered patterns:
    const questionRegex = /(?:^|\n)(?=(?:(?:\d{1,3}[.):-]|\b(?:Question|Q)\s*\d{1,3}[.):-]))\s*)/gi;
    const splitByNumbering = fullText
      .split(questionRegex)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (splitByNumbering.length >= 2) {
      return splitByNumbering;
    }

    // Fallback: blocks or paragraph chunks
    const allBlocks: string[] = [];
    for (const page of document.pages) {
      for (const b of page.blocks) {
        if (b.text.trim().length > 10) {
          allBlocks.push(b.text.trim());
        }
      }
    }

    if (allBlocks.length > 0) {
      return allBlocks;
    }

    return fullText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 10);
  }

  private extractAnswerAndExplanation(text: string): {
    answerKey?: string;
    explanation?: string;
  } {
    let answerKey: string | undefined;
    let explanation: string | undefined;

    const ansMatch = text.match(
      /(?:(?:Ans(?:wer)?|Key|Correct(?:\s+Answer)?)\s*[:-]\s*)([A-Fa-f0-9]|True|False)\b/i
    );
    if (ansMatch && ansMatch[1]) {
      answerKey = ansMatch[1].toUpperCase();
    }

    const expMatch = text.match(
      /(?:(?:Answer\s+)?Explanation|Note|Rationale)\s*[:-]\s*([^\n\r]+)/i
    );
    if (expMatch && expMatch[1]) {
      explanation = expMatch[1].trim();
    }

    return { answerKey, explanation };
  }

  private extractOptionsFromText(
    text: string,
    detectedAnswerKey?: string
  ): QuestionOptionDto[] {
    const options: QuestionOptionDto[] = [];
    // Match: A. Option, A) Option, (A) Option, a. Option, a) Option, (a) Option, [A] Option
    const optionRegex =
      /(?:^|\n|\r|\t|\s{2,})(?:\(?([A-Fa-f])[).:\-\]]|\b([A-Fa-f])[).:\-\]]\s+)([^\n\r]+?)(?=(?:\s{2,}|\n|\r|\t)(?:\(?[A-Fa-f][).:\-\]]|\b[A-Fa-f][).:\-\]])|(?:(?:Ans(?:wer)?|Key|Explanation|Note)\s*[:-]|$))/gi;

    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = optionRegex.exec(text)) !== null) {
      const rawKey = match[1] || match[2];
      const rawVal = match[3];

      if (rawKey && rawVal) {
        const key = rawKey.toUpperCase();
        let val = rawVal.trim();

        // Clean any trailing answer key indicator
        val = val
          .replace(/(?:Ans(?:wer)?|Key|Explanation|Note)\s*[:-].*$/i, "")
          .trim();

        if (val.length > 0) {
          const isCorrect = detectedAnswerKey
            ? key === detectedAnswerKey
            : index === 0;

          options.push({
            optionKey: key,
            optionText: val,
            orderIndex: index++,
            isCorrect,
          });
        }
      }
    }

    // Ensure at least one option is marked correct if options exist
    if (options.length > 0 && options[0] && !options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    return options;
  }

  private cleanQuestionStem(text: string): string {
    let stem = text;

    // 1. Remove leading question numbering (e.g. "1. ", "Question 1: ", "Q1. ")
    stem = stem.replace(
      /^(?:(?:\d{1,3}[.):-]|\b(?:Question|Q)\s*\d{1,3}[.):-]))\s*/i,
      ""
    );

    // 2. Cut off at the first option match (e.g. "A) ", "A. ", "(A) ")
    const firstOptionIndex = stem.search(
      /(?:^|\n|\r|\t|\s{2,})(?:\(?[A-Fa-f][).:\-\]]|\b[A-Fa-f][).:\-\]]\s+)/i
    );

    if (firstOptionIndex !== -1) {
      stem = stem.substring(0, firstOptionIndex);
    }

    // 3. Remove trailing Answer / Explanation labels
    stem = stem
      .replace(
        /(?:(?:Ans(?:wer)?|Key|Correct(?:\s+Answer)?|Explanation|Note)\s*[:-].*)$/is,
        ""
      )
      .trim();

    return stem;
  }

  private cleanStaleUploads() {
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, upload] of uploadCache.entries()) {
      if (upload.createdAt < oneHourAgo) {
        uploadCache.delete(id);
      }
    }
  }
}
