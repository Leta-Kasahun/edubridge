import crypto from "crypto";
import { DocumentExtractorLib } from "../../../lib/extraction/index.js";
import { QuestionService } from "./question.service.js";
import { QuestionBankRepository } from "../repository/question-bank.repository.js";
import {
  ExtractedDocument,
} from "../types/extraction.types.js";
import {
  QuestionUploadCandidate,
} from "../types/question-bank.types.js";
import {
  NotFoundError,
} from "../../../shared/exceptions/index.js";
import { parseQuestionsFromDocument } from "../utils/document-parser.util.js";

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
    const candidates = parseQuestionsFromDocument(document);
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

  private cleanStaleUploads() {
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, upload] of uploadCache.entries()) {
      if (upload.createdAt < oneHourAgo) {
        uploadCache.delete(id);
      }
    }
  }
}
