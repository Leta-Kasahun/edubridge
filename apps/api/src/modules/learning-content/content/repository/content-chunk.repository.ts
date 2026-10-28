import { prisma } from "../../../../lib/prisma.js";
import type { ChunkResult } from "../../../../lib/extraction/chunking/chunk-strategy.interface.js";
import type { HybridSearchResult } from "../types/rag.types.js";

interface RawChunkRow {
  readonly id: string;
  readonly contentId: string;
  readonly chunkIndex: number;
  readonly text: string;
  readonly metadata?: unknown;
  readonly score?: number;
}

export class ContentChunkRepository {
  async upsertForContent(
    tenantId: string,
    contentId: string,
    attachmentId: string | null,
    curriculum: {
      readonly subjectId?: string | null;
      readonly gradeId?: string | null;
      readonly unitId?: string | null;
      readonly topicId?: string | null;
      readonly curriculumVersionId?: string | null;
    },
    chunks: ChunkResult[],
    embeddings: number[][]
  ): Promise<number> {
    return prisma.$transaction(async (tx) => {
      await tx.contentChunk.deleteMany({
        where: { tenantId, contentId },
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];
        if (!chunk || !embedding) continue;

        const vectorStr = `[${embedding.join(",")}]`;
        const metadataJson = JSON.stringify(chunk.metadata);

        await tx.$executeRaw`
          INSERT INTO "ContentChunk" (
            "id", "tenantId", "contentId", "attachmentId", "chunkIndex",
            "text", "tokenCount", "chunkStrategy",
            "subjectId", "gradeId", "unitId", "topicId", "curriculumVersionId",
            "metadata", "embedding", "searchVector", "createdAt"
          )
          VALUES (
            gen_random_uuid(), ${tenantId}::uuid, ${contentId}::uuid, ${attachmentId ? attachmentId : null}::uuid, ${i},
            ${chunk.text}, ${chunk.tokenCount}, ${chunk.metadata.strategy},
            ${curriculum.subjectId ? curriculum.subjectId : null}::uuid,
            ${curriculum.gradeId ? curriculum.gradeId : null}::uuid,
            ${curriculum.unitId ? curriculum.unitId : null}::uuid,
            ${curriculum.topicId ? curriculum.topicId : null}::uuid,
            ${curriculum.curriculumVersionId ? curriculum.curriculumVersionId : null}::uuid,
            ${metadataJson}::jsonb,
            ${vectorStr}::vector,
            to_tsvector('english', ${chunk.text}),
            NOW()
          )
        `;
      }

      return chunks.length;
    });
  }

  async searchHybrid(
    tenantId: string,
    queryVector: number[],
    queryText: string,
    filters?: {
      readonly topicId?: string;
      readonly subjectId?: string;
      readonly gradeId?: string;
      readonly limit?: number;
    }
  ): Promise<HybridSearchResult[]> {
    const limit = filters?.limit ?? 10;
    const vectorStr = `[${queryVector.join(",")}]`;
    const topicId = filters?.topicId ?? null;
    const subjectId = filters?.subjectId ?? null;
    const gradeId = filters?.gradeId ?? null;

    // Dense search: cosine distance
    const denseRows = await prisma.$queryRaw<RawChunkRow[]>`
      SELECT "id", "contentId", "chunkIndex", "text", "metadata",
             1 - ("embedding" <=> ${vectorStr}::vector) AS score
      FROM "ContentChunk"
      WHERE "tenantId" = ${tenantId}::uuid
        AND (${topicId}::uuid IS NULL OR "topicId" = ${topicId}::uuid)
        AND (${subjectId}::uuid IS NULL OR "subjectId" = ${subjectId}::uuid)
        AND (${gradeId}::uuid IS NULL OR "gradeId" = ${gradeId}::uuid)
        AND "embedding" IS NOT NULL
      ORDER BY "embedding" <=> ${vectorStr}::vector
      LIMIT 20
    `;

    // Sparse search: full-text search rank
    const sparseRows = await prisma.$queryRaw<RawChunkRow[]>`
      SELECT "id", "contentId", "chunkIndex", "text", "metadata",
             ts_rank("searchVector", plainto_tsquery('english', ${queryText})) AS score
      FROM "ContentChunk"
      WHERE "tenantId" = ${tenantId}::uuid
        AND (${topicId}::uuid IS NULL OR "topicId" = ${topicId}::uuid)
        AND (${subjectId}::uuid IS NULL OR "subjectId" = ${subjectId}::uuid)
        AND (${gradeId}::uuid IS NULL OR "gradeId" = ${gradeId}::uuid)
        AND "searchVector" @@ plainto_tsquery('english', ${queryText})
      ORDER BY score DESC
      LIMIT 20
    `;

    // Reciprocal Rank Fusion (RRF)
    const RRF_K = 60;
    const rrfMap = new Map<string, { item: RawChunkRow; score: number }>();

    denseRows.forEach((row, rank) => {
      rrfMap.set(row.id, {
        item: row,
        score: 1 / (RRF_K + rank + 1),
      });
    });

    sparseRows.forEach((row, rank) => {
      const existing = rrfMap.get(row.id);
      const sparseScore = 1 / (RRF_K + rank + 1);
      if (existing) {
        existing.score += sparseScore;
      } else {
        rrfMap.set(row.id, {
          item: row,
          score: sparseScore,
        });
      }
    });

    return Array.from(rrfMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item, score }) => ({
        id: item.id,
        contentId: item.contentId,
        chunkIndex: item.chunkIndex,
        text: item.text,
        score,
        metadata: item.metadata,
      }));
  }
}

export const contentChunkRepository = new ContentChunkRepository();
