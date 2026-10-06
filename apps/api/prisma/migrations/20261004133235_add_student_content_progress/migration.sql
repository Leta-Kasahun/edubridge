-- CreateTable
CREATE TABLE "StudentContentProgress" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "contentId" UUID NOT NULL,
    "lastPositionSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentContentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentContentProgress_tenantId_studentId_isCompleted_idx" ON "StudentContentProgress"("tenantId", "studentId", "isCompleted");

-- CreateIndex
CREATE INDEX "StudentContentProgress_contentId_idx" ON "StudentContentProgress"("contentId");

-- CreateIndex
CREATE INDEX "StudentContentProgress_studentId_lastAccessedAt_idx" ON "StudentContentProgress"("studentId", "lastAccessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentContentProgress_studentId_contentId_key" ON "StudentContentProgress"("studentId", "contentId");

-- AddForeignKey
ALTER TABLE "StudentContentProgress" ADD CONSTRAINT "StudentContentProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentContentProgress" ADD CONSTRAINT "StudentContentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentContentProgress" ADD CONSTRAINT "StudentContentProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LearningContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
