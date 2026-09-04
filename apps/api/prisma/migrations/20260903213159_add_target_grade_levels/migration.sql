-- AlterTable
ALTER TABLE "LearningContent" ADD COLUMN     "targetGradeLevels" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
