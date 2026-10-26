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
import { NotFoundError, BadRequestError } from "../../../shared/exceptions/index.js";

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
        const queryVector = await this.ai.embedQuery(topic.title);
        const chunks = await this.chunkRepo.searchHybrid(tenantId, queryVector, topic.title, {
          topicId: input.topicId,
          subjectId: input.subjectId,
          gradeId: input.gradeId,
          limit: 5,
        });

        if (chunks.length > 0) {
          contextChunksText = chunks
            .map((c, i) => `--- Reference ${i + 1} ---\n${c.text}`)
            .join("\n\n");
        }
      } catch {
        // Fallback to generating without chunk context
      }

      const objectivesList = topic.objectives.length > 0
        ? topic.objectives.map((obj, i) => `${i + 1}. ${obj.statement}`).join("\n")
        : "Core conceptual understanding and practical applications.";

      const subjectName = topic.unit?.curriculumSubject?.subject?.name ?? "Subject";
      const gradeLevel = input.targetGradeLevel ?? topic.unit?.curriculumSubject?.grade?.level ?? 8;
      const curriculumVersionId = topic.unit?.curriculumSubject?.curriculumVersionId;

      const prompt = `You are an expert educational content writer creating comprehensive curriculum materials for ${subjectName} (Grade ${gradeLevel}).
Task: Write a ${input.contentType.toLowerCase().replace(/_/g, " ")} for the topic: "${topic.title}".

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
          systemInstruction: "You are a master teacher authoring rich, accurate, and engaging lesson materials.",
        }
      );

      const generated = result.data;
      if (!generated || !generated.body) {
        throw new BadRequestError("AI model did not return valid curriculum content");
      }

      const content = await prisma.$transaction(async (tx) => {
        return tx.learningContent.create({
          data: {
            tenantId,
            authorId: userId,
            title: generated.title || `${topic.title} - ${input.contentType}`,
            description: generated.summary,
            type: input.contentType === "WORKSHEET" ? "WORKSHEET" : "LESSON",
            scope: "TOPIC",
            source: "AI",
            status: "DRAFT",
            currentVersion: 1,
            subjectId: input.subjectId,
            gradeId: input.gradeId,
            unitId: topic.unitId,
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
            topics: {
              create: {
                topicId: input.topicId,
                isPrimary: true,
              },
            },
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
