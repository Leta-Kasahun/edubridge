-- CreateEnum
CREATE TYPE "ContentScope" AS ENUM ('SUBJECT', 'GRADE_SUBJECT', 'UNIT', 'TOPIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'TEXTBOOK';
ALTER TYPE "ContentType" ADD VALUE 'REFERENCE_BOOK';
ALTER TYPE "ContentType" ADD VALUE 'WORKSHEET';
ALTER TYPE "ContentType" ADD VALUE 'EXERCISE';
ALTER TYPE "ContentType" ADD VALUE 'PAST_EXAM_PAPER';
ALTER TYPE "ContentType" ADD VALUE 'TEACHER_GUIDE';
ALTER TYPE "ContentType" ADD VALUE 'STUDY_GUIDE';

-- AlterTable
ALTER TABLE "LearningContent" ADD COLUMN     "curriculumVersionId" UUID,
ADD COLUMN     "gradeId" UUID,
ADD COLUMN     "scope" "ContentScope" NOT NULL DEFAULT 'TOPIC',
ADD COLUMN     "subjectId" UUID,
ADD COLUMN     "unitId" UUID;

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_scope_idx" ON "LearningContent"("tenantId", "scope");

-- CreateIndex
CREATE INDEX "LearningContent_subjectId_idx" ON "LearningContent"("subjectId");

-- CreateIndex
CREATE INDEX "LearningContent_gradeId_idx" ON "LearningContent"("gradeId");

-- CreateIndex
CREATE INDEX "LearningContent_unitId_idx" ON "LearningContent"("unitId");

-- CreateIndex
CREATE INDEX "LearningContent_curriculumVersionId_idx" ON "LearningContent"("curriculumVersionId");

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "CurriculumVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
