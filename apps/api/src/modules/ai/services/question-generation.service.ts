import { prisma } from "../../../lib/prisma.js";
import { GeminiProvider, geminiProvider } from "../../../lib/ai/index.js";
import {
  ContentChunkRepository,
  contentChunkRepository,
} from "../../learning-content/content/repository/content-chunk.repository.js";
import {
  AiJobRepository,
  aiJobRepository,
} from "../repository/ai-job.repository.js";
import {
  GenerateQuestionsInput,
  GEMINI_QUESTION_RESPONSE_SCHEMA,
} from "../schemas/question-generation.schema.js";
import type { QuestionGenerationResult, AiJobDto } from "../types/ai.types.js";
import { NotFoundError, BadRequestError } from "../../../shared/exceptions/index.js";

export class QuestionGenerationService {
  constructor(
    private readonly ai: GeminiProvider = geminiProvider,
    private readonly chunkRepo: ContentChunkRepository = contentChunkRepository,
    private readonly jobRepo: AiJobRepository = aiJobRepository
  ) {}

  async generateQuestions(
    tenantId: string,
    userId: string,
    input: GenerateQuestionsInput
  ): Promise<{
    readonly job: AiJobDto;
    readonly questionBankId: string;
    readonly questionsCreated: number;
    readonly questionIds: readonly string[];
  }> {
    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: input.topicId },
      include: {
        unit: {
          include: {
            curriculumSubject: {
              include: {
                grade: true,
                subject: true,
              },
            },
          },
        },
        objectives: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!topic) {
      throw new NotFoundError("Curriculum topic not found");
    }

    const job = await this.jobRepo.createJob(tenantId, {
      jobType: "QUESTION_GENERATION",
      requestedById: userId,
      inputParams: input,
      model: "gemini-3.5-flash",
    });

    await this.jobRepo.updateJobStatus(tenantId, job.id, {
      status: "PROCESSING",
    });

    try {
      let contextChunksText = "";
      try {
        const queryVector = await this.ai.embedQuery(topic.title);
        const chunks = await this.chunkRepo.searchHybrid(tenantId, queryVector, topic.title, {
          topicId: input.topicId,
          subjectId: input.subjectId,
          gradeId: input.gradeId,
          limit: 5,
        });

        if (chunks.length > 0) {
          contextChunksText = chunks
            .map((c, i) => `--- Source Material ${i + 1} ---\n${c.text}`)
            .join("\n\n");
        }
      } catch {
        // Fallback to generating without chunk context if retrieval fails
      }

      const objectivesList = topic.objectives.length > 0
        ? topic.objectives.map((obj, i) => `${i + 1}. ${obj.statement}`).join("\n")
        : "General topic comprehension and core concepts.";

      const subjectName = topic.unit?.curriculumSubject?.subject?.name ?? "Subject";
      const gradeLevel = topic.unit?.curriculumSubject?.grade?.level ?? "Standard";

      const prompt = `You are an expert curriculum assessment specialist for ${subjectName} (Grade Level: ${gradeLevel}).
Your task is to generate ${input.count} high-quality practice questions for the topic: "${topic.title}".

TARGET DIFFICULTY: ${input.difficulty}
QUESTION FORMAT: ${input.questionType}

CURRICULUM LEARNING OBJECTIVES:
${objectivesList}

${contextChunksText ? `REFERENCE SOURCE MATERIALS:\n${contextChunksText}\n` : ""}

REQUIREMENTS:
1. Align strictly with Bloom's Taxonomy for the target difficulty level (${input.difficulty}).
2. Questions must be unambiguous, factually accurate, and pedagogically sound.
3. For MCQ questions, provide exactly 4 options (A, B, C, D) with realistic, plausible distractors and exactly 1 correct answer.
4. For TRUE_FALSE questions, provide exactly 2 options (A: True, B: False).
5. ALWAYS provide a thorough explanation for why the correct answer is right and why the distractors are wrong.
6. Return the output as valid JSON matching the specified schema.`;

      const result = await this.ai.generateStructured<QuestionGenerationResult>(
        prompt,
        GEMINI_QUESTION_RESPONSE_SCHEMA,
        {
          systemInstruction: "You are an expert assessment designer creating rigorous educational questions.",
        }
      );

      const generated = result.data?.questions ?? [];
      if (generated.length === 0) {
        throw new BadRequestError("AI model did not return any questions");
      }

      let targetBankId = input.questionBankId;
      if (targetBankId) {
        const bank = await prisma.questionBank.findFirst({
          where: { id: targetBankId, tenantId },
          select: { id: true },
        });
        if (!bank) {
          throw new NotFoundError("Question bank not found");
        }
      } else {
        const existingBank = await prisma.questionBank.findFirst({
          where: {
            tenantId,
            name: `AI Practice - ${topic.title}`,
          },
          select: { id: true },
        });

        if (existingBank) {
          targetBankId = existingBank.id;
        } else {
          const newBank = await prisma.questionBank.create({
            data: {
              tenantId,
              name: `AI Practice - ${topic.title}`,
              description: `Auto-generated practice questions for topic ${topic.title}`,
              status: "DRAFT",
              createdById: userId,
            },
          });
          targetBankId = newBank.id;
        }
      }

      const createdQuestionIds = await prisma.$transaction(async (tx) => {
        const ids: string[] = [];

        for (const q of generated) {
          const question = await tx.question.create({
            data: {
              questionBankId: targetBankId,
              createdById: userId,
              source: "AI",
              status: "DRAFT",
              currentVersion: 1,
              versions: {
                create: {
                  version: 1,
                  type: q.type,
                  difficulty: q.difficulty,
                  questionText: q.questionText,
                  explanation: q.explanation,
                  points: q.points || 1,
                  gradingStatus: "AUTO_GRADED",
                  createdById: userId,
                  options: q.options && q.options.length > 0 ? {
                    create: q.options.map((opt, idx) => ({
                      optionKey: opt.optionKey,
                      optionText: opt.optionText,
                      orderIndex: idx,
                      isCorrect: opt.isCorrect,
                    })),
                  } : undefined,
                },
              },
              topics: {
                create: {
                  topicId: input.topicId,
                  isPrimary: true,
                },
              },
            },
            select: { id: true },
          });

          ids.push(question.id);
        }

        return ids;
      });

      const updatedJob = await this.jobRepo.updateJobStatus(tenantId, job.id, {
        status: "COMPLETED",
        outputSummary: {
          count: createdQuestionIds.length,
          questionBankId: targetBankId,
          questionIds: createdQuestionIds,
        },
        promptTokens: result.promptTokens,
        outputTokens: result.outputTokens,
        completedAt: new Date(),
      });

      return {
        job: updatedJob,
        questionBankId: targetBankId,
        questionsCreated: createdQuestionIds.length,
        questionIds: createdQuestionIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error during question generation";
      await this.jobRepo.updateJobStatus(tenantId, job.id, {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      });
      throw error;
    }
  }
}

export const questionGenerationService = new QuestionGenerationService();
