import {
  ContentRepository,
  contentRepository,
} from "../repository/content.repository.js";
import {
  ContentChunkRepository,
  contentChunkRepository,
} from "../repository/content-chunk.repository.js";
import { StorageService, storageService } from "../../../../lib/storage/storage.service.js";
import {
  DocumentExtractorLib,
  cleanDocument,
  selectChunkStrategy,
  ExtractedDocument,
  ChunkResult,
} from "../../../../lib/extraction/index.js";
import { GeminiProvider, geminiProvider } from "../../../../lib/ai/index.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import type {
  IngestContentParams,
  IngestionResult,
  HybridSearchParams,
  HybridSearchResult,
} from "../types/rag.types.js";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export class ContentRagService {
  constructor(
    private readonly repository: ContentRepository = contentRepository,
    private readonly chunkRepository: ContentChunkRepository = contentChunkRepository,
    private readonly storage: StorageService = storageService,
    private readonly extractor: DocumentExtractorLib = new DocumentExtractorLib(),
    private readonly ai: GeminiProvider = geminiProvider
  ) {}

  async ingestContent(
    tenantId: string,
    contentId: string,
    params?: IngestContentParams
  ): Promise<IngestionResult> {
    const content = await this.repository.findById(tenantId, contentId);
    if (!content) {
      throw new NotFoundError("Learning content not found");
    }

    let attachments = content.attachments ?? [];
    if (params?.attachmentIds && params.attachmentIds.length > 0) {
      const allowedSet = new Set(params.attachmentIds);
      attachments = attachments.filter((att) => allowedSet.has(att.id));
    }

    const eligibleAttachments = attachments.filter(
      (att) => att.mimeType === "application/pdf" || att.mimeType.startsWith("image/")
    );

    const allChunks: ChunkResult[] = [];
    let totalPagesProcessed = 0;
    let strategyUsed: "semantic_boundary" | "fixed_sliding" = "semantic_boundary";
    let attachmentsProcessed = 0;
    let primaryAttachmentId: string | null = null;

    let originalCharCount = 0;
    let cleanedCharCount = 0;
    let removedBoilerplateLines = 0;
    let pagesSkipped = 0;

    for (const attachment of eligibleAttachments) {
      const { stream } = await this.storage.getFileStream(attachment.storageKey);
      const buffer = await streamToBuffer(stream);
      const extractedDoc = await this.extractor.extract(
        buffer,
        attachment.mimeType,
        attachment.fileName
      );

      const cleanedDoc = cleanDocument(extractedDoc);
      const chunker = selectChunkStrategy(extractedDoc.isScanned);
      strategyUsed = extractedDoc.isScanned ? "fixed_sliding" : "semantic_boundary";

      const chunks = chunker.chunk(cleanedDoc.fullText);
      if (chunks.length > 0) {
        if (!primaryAttachmentId) {
          primaryAttachmentId = attachment.id;
        }
        allChunks.push(...chunks);
        totalPagesProcessed += extractedDoc.pageCount;
        attachmentsProcessed += 1;
        originalCharCount += cleanedDoc.stats.originalCharCount;
        cleanedCharCount += cleanedDoc.stats.cleanedCharCount;
        removedBoilerplateLines += cleanedDoc.stats.removedBoilerplateLines;
        pagesSkipped += cleanedDoc.stats.pagesSkipped;
      }
    }

    if (allChunks.length === 0) {
      const versionBody = content.versions?.[0]?.body as { text?: string } | null;
      const rawText = typeof versionBody?.text === "string" ? versionBody.text.trim() : "";

      if (rawText.length > 0) {
        const syntheticDoc: ExtractedDocument = {
          filename: content.title,
          mimeType: "text/plain",
          pageCount: 1,
          isScanned: false,
          fullText: rawText,
          pages: [
            {
              pageNumber: 1,
              hasSelectableText: true,
              text: rawText,
              blocks: [],
            },
          ],
        };

        const cleanedDoc = cleanDocument(syntheticDoc);
        const chunker = selectChunkStrategy(false);
        const chunks = chunker.chunk(cleanedDoc.fullText);

        if (chunks.length > 0) {
          allChunks.push(...chunks);
          totalPagesProcessed = 1;
          strategyUsed = "semantic_boundary";
          originalCharCount = cleanedDoc.stats.originalCharCount;
          cleanedCharCount = cleanedDoc.stats.cleanedCharCount;
          removedBoilerplateLines = cleanedDoc.stats.removedBoilerplateLines;
          pagesSkipped = cleanedDoc.stats.pagesSkipped;
        }
      }
    }

    if (allChunks.length === 0) {
      throw new BadRequestError("No extractable text found in content or attachments");
    }

    const embeddings = await this.ai.embedDocuments(allChunks.map((c) => c.text));

    const primaryTopicId =
      content.topics.find((t) => t.isPrimary)?.topicId ??
      content.topics[0]?.topicId ??
      null;

    await this.chunkRepository.upsertForContent(
      tenantId,
      contentId,
      primaryAttachmentId,
      {
        subjectId: content.subjectId,
        gradeId: content.gradeId,
        unitId: content.unitId,
        topicId: primaryTopicId,
        curriculumVersionId: content.curriculumVersionId,
      },
      allChunks,
      embeddings
    );

    return {
      contentId,
      chunksCreated: allChunks.length,
      tokensIndexed: allChunks.reduce((acc, c) => acc + c.tokenCount, 0),
      pagesProcessed: totalPagesProcessed,
      strategy: strategyUsed,
      attachmentsProcessed,
      cleaningStats: {
        originalCharCount,
        cleanedCharCount,
        removedBoilerplateLines,
        pagesSkipped,
      },
    };
  }

  async search(
    tenantId: string,
    params: HybridSearchParams
  ): Promise<HybridSearchResult[]> {
    const queryVector = await this.ai.embedQuery(params.query);
    return this.chunkRepository.searchHybrid(tenantId, queryVector, params.query, {
      topicId: params.topicId,
      subjectId: params.subjectId,
      gradeId: params.gradeId,
      limit: params.limit,
    });
  }
}

export const contentRagService = new ContentRagService();
