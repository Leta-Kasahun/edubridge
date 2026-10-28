-- ============================================================
-- Step 1: Enable pgvector extension for vector embeddings
-- Required for 768-dimensional gemini-embedding-001 vector storage
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "ContentChunk" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "contentId" UUID NOT NULL,
    "attachmentId" UUID,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "chunkStrategy" TEXT NOT NULL,
    "subjectId" UUID,
    "gradeId" UUID,
    "unitId" UUID,
    "topicId" UUID,
    "curriculumVersionId" UUID,
    "metadata" JSONB,
    "embedding" vector(768),
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGenerationJob" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedById" UUID NOT NULL,
    "inputParams" JSONB NOT NULL,
    "outputSummary" JSONB,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "outputTokens" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AiGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentChunk_tenantId_contentId_idx" ON "ContentChunk"("tenantId", "contentId");

-- CreateIndex
CREATE INDEX "ContentChunk_contentId_chunkIndex_idx" ON "ContentChunk"("contentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "ContentChunk_tenantId_topicId_idx" ON "ContentChunk"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "ContentChunk_tenantId_subjectId_idx" ON "ContentChunk"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "ContentChunk_tenantId_gradeId_idx" ON "ContentChunk"("tenantId", "gradeId");

-- CreateIndex
CREATE INDEX "ContentChunk_tenantId_unitId_idx" ON "ContentChunk"("tenantId", "unitId");

-- CreateIndex
CREATE INDEX "AiGenerationJob_tenantId_jobType_status_idx" ON "AiGenerationJob"("tenantId", "jobType", "status");

-- CreateIndex
CREATE INDEX "AiGenerationJob_tenantId_requestedById_idx" ON "AiGenerationJob"("tenantId", "requestedById");

-- CreateIndex
CREATE INDEX "AiGenerationJob_tenantId_createdAt_idx" ON "AiGenerationJob"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LearningContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentChunk" ADD CONSTRAINT "ContentChunk_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGenerationJob" ADD CONSTRAINT "AiGenerationJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGenerationJob" ADD CONSTRAINT "AiGenerationJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Step 2: Vector and Full-Text Search Indexes for Hybrid Search
-- ============================================================

-- Fast Approximate Nearest Neighbor (ANN) index for vector cosine similarity search
-- lists = 100 provides optimal query performance/recall balance for national roster content
CREATE INDEX IF NOT EXISTS "contentchunk_embedding_ivfflat_idx"
  ON "ContentChunk" USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

-- GIN index for fast sparse full-text search across content chunks
CREATE INDEX IF NOT EXISTS "contentchunk_tsv_gin_idx"
  ON "ContentChunk" USING GIN ("searchVector");
