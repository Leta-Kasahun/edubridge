-- CreateEnum
CREATE TYPE "BookmarkTargetType" AS ENUM ('QUESTION', 'TOPIC', 'LEARNING_CONTENT');

-- CreateTable
CREATE TABLE "StudentBookmark" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "targetType" "BookmarkTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "note" VARCHAR(500),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentBookmark_tenantId_studentId_targetType_idx" ON "StudentBookmark"("tenantId", "studentId", "targetType");

-- CreateIndex
CREATE INDEX "StudentBookmark_tenantId_targetType_targetId_idx" ON "StudentBookmark"("tenantId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBookmark_studentId_targetType_targetId_key" ON "StudentBookmark"("studentId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "StudentBookmark" ADD CONSTRAINT "StudentBookmark_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBookmark" ADD CONSTRAINT "StudentBookmark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
