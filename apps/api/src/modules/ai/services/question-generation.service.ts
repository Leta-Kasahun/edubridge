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
import type { QuestionType, DifficultyLevel } from "../../../generated/prisma/enums.js";

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
    let scopeTitle = "Curriculum Assessment";
    let subjectName = "Subject";
    let gradeLevel = "Standard";
    let objectivesList = "General comprehension, problem solving, and core curriculum concepts.";
    let primaryTopicId: string | null = null;
    let querySeedText = "";

    if (input.scope === "TOPIC" && input.topicId) {
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

      if (topic) {
        primaryTopicId = topic.id;
        scopeTitle = `Topic: "${topic.title}"`;
        querySeedText = topic.title;
        subjectName = topic.unit?.curriculumSubject?.subject?.name ?? subjectName;
        gradeLevel = topic.unit?.curriculumSubject?.grade?.level
          ? `Grade ${topic.unit.curriculumSubject.grade.level}`
          : gradeLevel;
        if (topic.objectives.length > 0) {
          objectivesList = topic.objectives
            .map((obj, i) => `${i + 1}. ${obj.statement}`)
            .join("\n");
        }
      }
    } else if (input.scope === "UNIT" && input.unitId) {
      const unit = await prisma.curriculumUnit.findUnique({
        where: { id: input.unitId },
        include: {
          curriculumSubject: {
            include: {
              grade: true,
              subject: true,
            },
          },
          topics: {
            include: {
              objectives: { orderBy: { orderIndex: "asc" } },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      if (unit) {
        scopeTitle = `Unit / Chapter: "${unit.title}"`;
        querySeedText = unit.title;
        subjectName = unit.curriculumSubject?.subject?.name ?? subjectName;
        gradeLevel = unit.curriculumSubject?.grade?.level
          ? `Grade ${unit.curriculumSubject.grade.level}`
          : gradeLevel;
        primaryTopicId = unit.topics[0]?.id ?? null;
        const allObjectives = unit.topics.flatMap((t) => t.objectives);
        if (allObjectives.length > 0) {
          objectivesList = allObjectives
            .slice(0, 15)
            .map((obj, i) => `${i + 1}. ${obj.statement}`)
            .join("\n");
        } else if (unit.topics.length > 0) {
          objectivesList = unit.topics
            .map((t, i) => `${i + 1}. Topic: ${t.title}`)
            .join("\n");
        }
      }
    } else if (input.scope === "MOCK_EXAM" && input.examContextId) {
      const examCtx = await prisma.examContext.findFirst({
        where: { id: input.examContextId, tenantId },
        include: {
          grade: true,
          subject: true,
        },
      });

      if (examCtx) {
        scopeTitle = `Mock Exam: "${examCtx.name}" (${examCtx.scope} Scope${examCtx.examYear ? ` - ${examCtx.examYear}` : ""})`;
        querySeedText = examCtx.name;
        subjectName = examCtx.subject?.name ?? subjectName;
        gradeLevel = examCtx.grade?.level ? `Grade ${examCtx.grade.level}` : gradeLevel;
      }
    }

    if (querySeedText === "") {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
        select: { name: true },
      });
      if (subject) {
        subjectName = subject.name;
        scopeTitle =
          input.scope === "MOCK_EXAM"
            ? `Standardized Mock Exam: ${subject.name}`
            : `Subject Assessment: ${subject.name}`;
        querySeedText = subject.name;
      }
      if (input.gradeId) {
        const grade = await prisma.grade.findUnique({
          where: { id: input.gradeId },
          select: { level: true },
        });
        if (grade) {
          gradeLevel = `Grade ${grade.level}`;
        }
      }
    }

    const dist = input.typeDistribution;
    const isMultiDistribution = Boolean(
      dist &&
        ((dist.MCQ ?? 0) +
          (dist.TRUE_FALSE ?? 0) +
          (dist.SHORT_ANSWER ?? 0) +
          (dist.NUMERIC ?? 0)) > 0
    );

    const targetTotalCount = isMultiDistribution
      ? (dist?.MCQ ?? 0) +
        (dist?.TRUE_FALSE ?? 0) +
        (dist?.SHORT_ANSWER ?? 0) +
        (dist?.NUMERIC ?? 0)
      : input.count;

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
        const queryVector = await this.ai.embedQuery(querySeedText || scopeTitle);
        const chunks = await this.chunkRepo.searchHybrid(
          tenantId,
          queryVector,
          querySeedText || scopeTitle,
          {
            topicId: primaryTopicId || undefined,
            subjectId: input.subjectId,
            gradeId: input.gradeId || undefined,
            limit: 5,
          }
        );

        if (chunks.length > 0) {
          contextChunksText = chunks
            .map((c, i) => `--- Source Material ${i + 1} ---\n${c.text}`)
            .join("\n\n");
        }
      } catch {
        // Fallback to generating without chunk context if retrieval fails
      }

      let formatInstructions = "";
      if (isMultiDistribution && dist) {
        formatInstructions = `GENERATE THE FOLLOWING EXACT DISTRIBUTION OF QUESTIONS (TOTAL: ${targetTotalCount}):
${dist.MCQ ? `- Exactly ${dist.MCQ} Multiple Choice (MCQ) questions` : ""}
${dist.TRUE_FALSE ? `- Exactly ${dist.TRUE_FALSE} True/False (TRUE_FALSE) questions` : ""}
${dist.SHORT_ANSWER ? `- Exactly ${dist.SHORT_ANSWER} Short Answer / Fill in Blank (SHORT_ANSWER) questions` : ""}
${dist.NUMERIC ? `- Exactly ${dist.NUMERIC} Calculation / Quantitative (NUMERIC) questions` : ""}`;
      } else if (input.questionType === "MIXED") {
        formatInstructions = `Generate a balanced variety of question types totaling ${targetTotalCount} questions:
- Multiple Choice (MCQ)
- True/False (TRUE_FALSE)
- Short Answer / Fill in the blank (SHORT_ANSWER)
- Calculation / Quantitative (NUMERIC)`;
      } else {
        formatInstructions = `Generate ${targetTotalCount} questions of format: ${input.questionType}`;
      }

      let difficultyInstruction = `TARGET DIFFICULTY: ${input.difficulty}`;
      if (input.difficulty === "MIXED") {
        difficultyInstruction = `TARGET DIFFICULTY: MIXED (Provide a balanced distribution across Easy [~30%], Medium [~50%], and Challenging/Hard [~20%]).`;
      }

      const prompt = `You are an expert curriculum assessment and examination author for ${subjectName} (${gradeLevel}).
Your task is to generate ${targetTotalCount} high-quality questions for ${scopeTitle}.

${difficultyInstruction}
${formatInstructions}

CURRICULUM LEARNING OBJECTIVES & TOPICS:
${objectivesList}

${contextChunksText ? `REFERENCE SOURCE MATERIALS:\n${contextChunksText}\n` : ""}

REQUIREMENTS:
1. Align strictly with Bloom's Taxonomy for the target difficulty level(s).
2. Questions must be unambiguous, factually accurate, and pedagogically sound.
3. For MCQ questions, provide exactly 4 options (A, B, C, D) with realistic, plausible distractors and exactly 1 correct answer.
4. For TRUE_FALSE questions, provide exactly 2 options (A: True, B: False) with the correct one marked.
5. For SHORT_ANSWER questions, provide the exact required word, phrase, or short response in 'correctAnswer'.
6. For NUMERIC questions, provide a clear mathematical, scientific, or quantitative calculation problem. Put the exact final numeric value in 'correctAnswer' and step-by-step working in 'explanation'.
7. ALWAYS provide a thorough explanation for why the correct answer is right and why distractors are wrong.
8. Return the output as valid JSON matching the specified schema.`;

      const result = await this.ai.generateStructured<QuestionGenerationResult>(
        prompt,
        GEMINI_QUESTION_RESPONSE_SCHEMA,
        {
          systemInstruction:
            "You are an expert assessment designer creating rigorous educational questions.",
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
        if (input.examContextId) {
          const contextExists = await prisma.examContext.findFirst({
            where: { id: input.examContextId, tenantId },
            select: { id: true },
          });
          if (contextExists) {
            try {
              await prisma.questionBank.update({
                where: { id: targetBankId },
                data: {
                  examContexts: {
                    connect: { id: contextExists.id },
                  },
                },
              });
            } catch {
              // Already connected or safe fallback
            }
          }
        }
      } else {
        const cleanTitle = scopeTitle.replace(/["\n]/g, "").slice(0, 50);
        const existingBank = await prisma.questionBank.findFirst({
          where: {
            tenantId,
            name: `AI Practice - ${cleanTitle}`,
          },
          select: { id: true },
        });

        if (existingBank) {
          targetBankId = existingBank.id;
        } else {
          let verifiedExamContextId: string | undefined = undefined;
          if (input.examContextId) {
            const contextExists = await prisma.examContext.findFirst({
              where: { id: input.examContextId, tenantId },
              select: { id: true },
            });
            if (contextExists) {
              verifiedExamContextId = contextExists.id;
            }
          }

          const newBank = await prisma.questionBank.create({
            data: {
              tenantId,
              name: `AI Practice - ${cleanTitle}`,
              description: `Auto-generated practice questions for ${scopeTitle}`,
              status: "DRAFT",
              createdById: userId,
              examContexts: verifiedExamContextId
                ? {
                    connect: { id: verifiedExamContextId },
                  }
                : undefined,
            },
          });
          targetBankId = newBank.id;
        }
      }

      let verifiedTopicId: string | null = null;
      if (primaryTopicId) {
        const topicExists = await prisma.curriculumTopic.findUnique({
          where: { id: primaryTopicId },
          select: { id: true },
        });
        if (topicExists) {
          verifiedTopicId = topicExists.id;
        }
      }

      const createdQuestionIds = await prisma.$transaction(async (tx) => {
        const ids: string[] = [];

        for (const q of generated) {
          const rawType = (q.type || "MCQ") as QuestionType;
          const rawDifficulty = (q.difficulty || "MEDIUM") as DifficultyLevel;

          const optionKeys = ["A", "B", "C", "D", "E", "F"];
          const usedKeys = new Set<string>();

          let finalOptions:
            | {
                optionKey: string;
                optionText: string;
                orderIndex: number;
                isCorrect: boolean;
              }[]
            | undefined = undefined;

          if (q.options && q.options.length > 0) {
            finalOptions = q.options.map((opt, idx) => {
              let key = (opt.optionKey || "").toUpperCase().trim();
              if (!key || usedKeys.has(key)) {
                key = optionKeys.find((k) => !usedKeys.has(k)) || `OPT_${idx + 1}`;
              }
              usedKeys.add(key);
              return {
                optionKey: key,
                optionText: opt.optionText || `Option ${key}`,
                orderIndex: idx,
                isCorrect: Boolean(opt.isCorrect),
              };
            });

            if (finalOptions[0] && !finalOptions.some((o) => o.isCorrect)) {
              finalOptions[0].isCorrect = true;
            }
          } else if (q.correctAnswer) {
            finalOptions = [
              {
                optionKey: "A",
                optionText: q.correctAnswer,
                orderIndex: 0,
                isCorrect: true,
              },
            ];
          }

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
                  type: rawType,
                  difficulty: rawDifficulty,
                  questionText: q.questionText,
                  explanation: q.explanation || "Detailed explanation provided by AI.",
                  points: q.points || 1,
                  gradingStatus:
                    rawType === "SHORT_ANSWER" ? "MANUAL_GRADING" : "AUTO_GRADED",
                  configuration: q.correctAnswer
                    ? { correctAnswer: q.correctAnswer }
                    : undefined,
                  createdById: userId,
                  options:
                    finalOptions && finalOptions.length > 0
                      ? { create: finalOptions }
                      : undefined,
                },
              },
              topics: verifiedTopicId
                ? {
                    create: {
                      topicId: verifiedTopicId,
                      isPrimary: true,
                    },
                  }
                : undefined,
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error during question generation";
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
