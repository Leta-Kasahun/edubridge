import { prisma } from "../../../lib/prisma.js";
import { redis, RedisKeys } from "../../../lib/redis.js";
import { GeminiProvider, geminiProvider } from "../../../lib/ai/index.js";
import {
  ContentChunkRepository,
  contentChunkRepository,
} from "../../learning-content/content/repository/content-chunk.repository.js";
import { AI_CONSTANTS } from "../../../shared/constants/ai.constants.js";
import { NotFoundError } from "../../../shared/exceptions/index.js";

export class ExplanationService {
  constructor(
    private readonly ai: GeminiProvider = geminiProvider,
    private readonly chunkRepo: ContentChunkRepository = contentChunkRepository
  ) {}

  async *streamExplanation(
    tenantId: string,
    questionId: string,
    studentAnswer?: string
  ): AsyncGenerator<string, void, unknown> {
    const cacheKey = RedisKeys.ai.explanationCache(questionId);

    if (!studentAnswer) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          yield cached;
          return;
        }
      } catch {
        // Cache miss proceeds to generation
      }
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        questionBank: { tenantId },
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
          include: {
            options: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        topics: {
          include: { topic: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    const version = question.versions[0];
    if (!version) {
      throw new NotFoundError("Question version not found");
    }

    const primaryTopic = question.topics.find((t) => t.isPrimary)?.topic ?? question.topics[0]?.topic;
    const topicId = primaryTopic?.id;
    const topicTitle = primaryTopic?.title ?? "General";

    let contextText = "";
    if (topicId) {
      try {
        const queryVector = await this.ai.embedQuery(version.questionText);
        const chunks = await this.chunkRepo.searchHybrid(tenantId, queryVector, version.questionText, {
          topicId,
          limit: 2,
        });
        if (chunks.length > 0) {
          contextText = chunks.map((c, i) => `[Source ${i + 1}]: ${c.text}`).join("\n\n");
        }
      } catch {
        // Search failure falls back to prompt without chunks
      }
    }

    const optionsText = version.options.length > 0
      ? version.options.map((opt) => `  ${opt.optionKey}. ${opt.optionText}`).join("\n")
      : "";

    const correctOption = version.options.find((opt) => opt.isCorrect);
    const correctAnswerText = correctOption
      ? `${correctOption.optionKey}: ${correctOption.optionText}`
      : version.explanation ?? "N/A";

    const prompt = `A student is reviewing this question:

QUESTION: ${version.questionText}
${optionsText ? `OPTIONS:\n${optionsText}` : ""}
CORRECT ANSWER: ${correctAnswerText}
TOPIC: ${topicTitle}
${studentAnswer ? `STUDENT'S ANSWER: ${studentAnswer}` : ""}
${contextText ? `LESSON MATERIAL:\n${contextText}` : ""}

Task: Write a simple, friendly, step-by-step explanation:
1. Explain clearly why the correct answer is right using plain words.
2. If the student gave an answer that was incorrect, gently clarify where the misunderstanding happened.
3. Share a helpful tip or memory trick so they easily remember this concept next time.
4. Clean formatting: DO NOT use asterisks (*** or **) in your text. Write clean, natural sentences.`;

    let fullGeneratedText = "";
    for await (const chunk of this.ai.stream(prompt, {
      temperature: AI_CONSTANTS.TEMPERATURE_EXPLANATION,
      systemInstruction: "You are a friendly, encouraging learning assistant providing clear, simple, and clean guidance to students without asterisks.",
    })) {
      fullGeneratedText += chunk;
      yield chunk;
    }

    if (!studentAnswer && fullGeneratedText.length > 0) {
      redis.set(cacheKey, fullGeneratedText, "EX", AI_CONSTANTS.EXPLANATION_CACHE_TTL).catch(() => {});
    }
  }
}

export const explanationService = new ExplanationService();
