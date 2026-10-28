import { prisma } from "../../../lib/prisma.js";
import { GeminiProvider, geminiProvider } from "../../../lib/ai/index.js";
import {
  ContentChunkRepository,
  contentChunkRepository,
} from "../../learning-content/content/repository/content-chunk.repository.js";
import { AI_CONSTANTS } from "../../../shared/constants/ai.constants.js";

export class TutorService {
  constructor(
    private readonly ai: GeminiProvider = geminiProvider,
    private readonly chunkRepo: ContentChunkRepository = contentChunkRepository
  ) {}

  async *streamTutor(
    tenantId: string,
    message: string,
    topicId?: string
  ): AsyncGenerator<string, void, unknown> {
    let contextChunksText = "";
    let topicContext = "";

    if (topicId) {
      const topic = await prisma.curriculumTopic.findUnique({
        where: { id: topicId },
        include: {
          unit: {
            include: {
              curriculumSubject: {
                include: { subject: true, grade: true },
              },
            },
          },
          objectives: {
            take: 3,
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      if (topic) {
        const subjectName = topic.unit?.curriculumSubject?.subject?.name ?? "Subject";
        const gradeLevel = topic.unit?.curriculumSubject?.grade?.level ?? "Grade";
        const objectives = topic.objectives.map((o) => o.statement).join("; ");
        topicContext = `Current Topic: "${topic.title}" (${subjectName}, Grade ${gradeLevel}). Objectives: ${objectives}`;
      }
    }

    try {
      const queryVector = await this.ai.embedQuery(message);
      const chunks = await this.chunkRepo.searchHybrid(tenantId, queryVector, message, {
        topicId,
        limit: 3,
      });

      if (chunks.length > 0) {
        contextChunksText = chunks
          .map((c, i) => `[Reference ${i + 1}]: ${c.text}`)
          .join("\n\n");
      }
    } catch {
      // Retrieval fallback
    }

    const prompt = `You are a friendly, supportive AI Assistant on EduBridge.
Your goal is to explain concepts clearly using simple, everyday words so that any student can easily understand and learn.
Never use complicated technical jargon. When explaining a topic, break it down step-by-step with clear examples.

${topicContext ? `TOPIC CONTEXT:\n${topicContext}\n` : ""}
${contextChunksText ? `CURRICULUM LESSON MATERIAL:\n${contextChunksText}\n` : ""}

STUDENT'S MESSAGE:
"${message}"

GUIDELINES:
1. Keep explanations direct, friendly, and easy to read.
2. Break long points into short bullet points with dashes (-).
3. If the student asks what to study next, suggest 2-3 specific topics to review.
4. If appropriate, give one simple practice question to check their understanding.
5. Format cleanly without asterisks: DO NOT use *** or **. Write clean, natural sentences.`;

    for await (const chunk of this.ai.stream(prompt, {
      temperature: AI_CONSTANTS.TEMPERATURE_EXPLANATION,
      systemInstruction: "You are a friendly, encouraging learning assistant helping students understand school lessons in simple, clean language without asterisks.",
    })) {
      yield chunk;
    }
  }
}

export const tutorService = new TutorService();
