-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "curriculumVersionId" UUID,
ADD COLUMN     "gradeId" UUID,
ADD COLUMN     "scope" "ContentScope" DEFAULT 'TOPIC',
ADD COLUMN     "subjectId" UUID,
ADD COLUMN     "topicId" UUID,
ADD COLUMN     "unitId" UUID;

-- CreateIndex
CREATE INDEX "Assessment_tenantId_subjectId_idx" ON "Assessment"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "Assessment_tenantId_gradeId_idx" ON "Assessment"("tenantId", "gradeId");

-- CreateIndex
CREATE INDEX "Assessment_tenantId_unitId_idx" ON "Assessment"("tenantId", "unitId");

-- CreateIndex
CREATE INDEX "Assessment_tenantId_topicId_idx" ON "Assessment"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "Assessment_tenantId_scope_idx" ON "Assessment"("tenantId", "scope");

-- CreateIndex
CREATE INDEX "Assessment_subjectId_idx" ON "Assessment"("subjectId");

-- CreateIndex
CREATE INDEX "Assessment_gradeId_idx" ON "Assessment"("gradeId");

-- CreateIndex
CREATE INDEX "Assessment_unitId_idx" ON "Assessment"("unitId");

-- CreateIndex
CREATE INDEX "Assessment_topicId_idx" ON "Assessment"("topicId");

-- CreateIndex
CREATE INDEX "Assessment_curriculumVersionId_idx" ON "Assessment"("curriculumVersionId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CurriculumTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "CurriculumVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
