import { prisma } from "../../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
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
  GenerateContentInput,
  GEMINI_CONTENT_RESPONSE_SCHEMA,
} from "../schemas/content-generation.schema.js";
import type { GeneratedContentResult, AiJobDto } from "../types/ai.types.js";
import { BadRequestError } from "../../../shared/exceptions/index.js";

export class ContentGenerationService {
  constructor(
    private readonly ai: GeminiProvider = geminiProvider,
    private readonly chunkRepo: ContentChunkRepository = contentChunkRepository,
    private readonly jobRepo: AiJobRepository = aiJobRepository
  ) {}

  async generateContent(
    tenantId: string,
    userId: string,
    input: GenerateContentInput
  ): Promise<{
    readonly job: AiJobDto;
    readonly contentId: string;
    readonly title: string;
  }> {
    let scopeTitle = "Curriculum Content";
    let subjectName = "Subject";
    let gradeLevel = input.targetGradeLevel ?? 8;
    let objectivesList = "Core conceptual understanding and practical applications.";
    let primaryTopicId: string | null = null;
    let unitId: string | null = null;
    let curriculumVersionId: string | undefined;
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
        unitId = topic.unitId;
        scopeTitle = `Topic: "${topic.title}"`;
        querySeedText = topic.title;
        subjectName = topic.unit?.curriculumSubject?.subject?.name ?? subjectName;
        gradeLevel =
          input.targetGradeLevel ?? topic.unit?.curriculumSubject?.grade?.level ?? gradeLevel;
        curriculumVersionId = topic.unit?.curriculumSubject?.curriculumVersionId;
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
        unitId = unit.id;
        scopeTitle = `Chapter / Unit: "${unit.title}"`;
        querySeedText = unit.title;
        subjectName = unit.curriculumSubject?.subject?.name ?? subjectName;
        gradeLevel =
          input.targetGradeLevel ?? unit.curriculumSubject?.grade?.level ?? gradeLevel;
        curriculumVersionId = unit.curriculumSubject?.curriculumVersionId;
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
    }

    if (querySeedText === "") {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
        select: { name: true },
      });
      if (subject) {
        subjectName = subject.name;
        scopeTitle = `Subject Overview: ${subject.name}`;
        querySeedText = subject.name;
      }
      if (input.gradeId) {
        const grade = await prisma.grade.findUnique({
          where: { id: input.gradeId },
          select: { level: true },
        });
        if (grade) {
          gradeLevel = input.targetGradeLevel ?? grade.level;
        }
      }
    }

    const job = await this.jobRepo.createJob(tenantId, {
      jobType: "CONTENT_GENERATION",
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
            .map((c, i) => `--- Reference ${i + 1} ---\n${c.text}`)
            .join("\n\n");
        }
      } catch {
        // Fallback to generating without chunk context
      }

      const prompt = `You are an expert educational content writer creating comprehensive curriculum materials for ${subjectName} (Grade ${gradeLevel}).
Task: Write a ${input.contentType.toLowerCase().replace(/_/g, " ")} for ${scopeTitle}.

TONE: ${input.tone}
TARGET GRADE LEVEL: Grade ${gradeLevel}

LEARNING OBJECTIVES:
${objectivesList}

${contextChunksText ? `EXISTING SOURCE MATERIAL:\n${contextChunksText}\n` : ""}

REQUIREMENTS:
1. Ground your explanations firmly in the educational objectives and source materials.
2. Structure the content logically with clear section headings.
3. Include real-world, relatable examples and practical applications.
4. Conclude with a clear summary and key takeaways.
5. Return the result strictly in the JSON format specified in the schema.`;

      const result = await this.ai.generateStructured<GeneratedContentResult>(
        prompt,
        GEMINI_CONTENT_RESPONSE_SCHEMA,
        {
          systemInstruction:
            "You are a master teacher authoring rich, accurate, and engaging lesson materials.",
        }
      );

      const generated = result.data;
      if (!generated || !generated.body) {
        throw new BadRequestError("AI model did not return valid curriculum content");
      }

      const targetScope =
        input.scope === "UNIT" ? "UNIT" : input.scope === "SUBJECT" ? "SUBJECT" : "TOPIC";

      let verifiedUnitId: string | undefined = undefined;
      if (unitId) {
        const u = await prisma.curriculumUnit.findUnique({
          where: { id: unitId },
          select: { id: true },
        });
        if (u) {
          verifiedUnitId = u.id;
        }
      }

      let verifiedTopicId: string | null = null;
      if (primaryTopicId) {
        const t = await prisma.curriculumTopic.findUnique({
          where: { id: primaryTopicId },
          select: { id: true },
        });
        if (t) {
          verifiedTopicId = t.id;
        }
      }

      const content = await prisma.$transaction(async (tx) => {
        return tx.learningContent.create({
          data: {
            tenantId,
            authorId: userId,
            title: generated.title || `${scopeTitle} - ${input.contentType}`,
            description: generated.summary,
            type: input.contentType === "WORKSHEET" ? "WORKSHEET" : "LESSON",
            scope: targetScope,
            source: "AI",
            status: "DRAFT",
            currentVersion: 1,
            subjectId: input.subjectId,
            gradeId: input.gradeId,
            unitId: verifiedUnitId,
            curriculumVersionId,
            versions: {
              create: {
                version: 1,
                body: {
                  text: generated.body,
                  summary: generated.summary,
                  sections: generated.sections,
                } as unknown as Prisma.InputJsonValue,
                changeNote: "Initial draft generated by AI",
                createdById: userId,
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
          select: { id: true, title: true },
        });
      });

      const updatedJob = await this.jobRepo.updateJobStatus(tenantId, job.id, {
        status: "COMPLETED",
        outputSummary: {
          contentId: content.id,
          title: content.title,
        },
        promptTokens: result.promptTokens,
        outputTokens: result.outputTokens,
        completedAt: new Date(),
      });

      return {
        job: updatedJob,
        contentId: content.id,
        title: content.title,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error during content generation";
      await this.jobRepo.updateJobStatus(tenantId, job.id, {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      });
      throw error;
    }
  }
}

export const contentGenerationService = new ContentGenerationService();
