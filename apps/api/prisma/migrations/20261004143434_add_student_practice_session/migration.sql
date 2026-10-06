-- CreateTable
CREATE TABLE "StudentPracticeSession" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "bankId" UUID NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "secondsElapsed" INTEGER NOT NULL DEFAULT 0,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "selectedAnswers" JSONB NOT NULL DEFAULT '{}',
    "flaggedQuestionIds" JSONB NOT NULL DEFAULT '[]',
    "eliminatedOptions" JSONB NOT NULL DEFAULT '{}',
    "revealedExplanations" JSONB NOT NULL DEFAULT '{}',
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentPracticeSession_tenantId_studentId_isFinished_idx" ON "StudentPracticeSession"("tenantId", "studentId", "isFinished");

-- CreateIndex
CREATE INDEX "StudentPracticeSession_bankId_idx" ON "StudentPracticeSession"("bankId");

-- CreateIndex
CREATE INDEX "StudentPracticeSession_studentId_lastAccessedAt_idx" ON "StudentPracticeSession"("studentId", "lastAccessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPracticeSession_studentId_bankId_key" ON "StudentPracticeSession"("studentId", "bankId");

-- AddForeignKey
ALTER TABLE "StudentPracticeSession" ADD CONSTRAINT "StudentPracticeSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPracticeSession" ADD CONSTRAINT "StudentPracticeSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPracticeSession" ADD CONSTRAINT "StudentPracticeSession_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
