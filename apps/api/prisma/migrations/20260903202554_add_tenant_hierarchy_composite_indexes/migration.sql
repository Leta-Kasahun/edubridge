-- CreateIndex
CREATE INDEX "LearningContent_tenantId_scope_status_idx" ON "LearningContent"("tenantId", "scope", "status");

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_subjectId_idx" ON "LearningContent"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_gradeId_idx" ON "LearningContent"("tenantId", "gradeId");

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_unitId_idx" ON "LearningContent"("tenantId", "unitId");

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_gradeId_subjectId_idx" ON "LearningContent"("tenantId", "gradeId", "subjectId");

-- CreateIndex
CREATE INDEX "LearningContent_tenantId_curriculumVersionId_idx" ON "LearningContent"("tenantId", "curriculumVersionId");
