import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { redis, RedisKeys } from "../redis.js";
import { AI_CONSTANTS } from "../../shared/constants/ai.constants.js";
import { sha256 } from "../../shared/utils/hash.util.js";
import { InternalServerError } from "../../shared/exceptions/internal-server-error.js";
import type {
  ILlmProvider,
  IEmbeddingProvider,
  LlmGenerateOptions,
  LlmGenerateResult,
  EmbeddingTaskType,
} from "./ai.types.js";

export class GeminiProvider implements ILlmProvider, IEmbeddingProvider {
  private client: GoogleGenAI | null = null;
  private readonly llmModel = env.GEMINI_LLM_MODEL;
  private readonly embeddingModel = env.GEMINI_EMBEDDING_MODEL;
  private readonly dimensions = AI_CONSTANTS.EMBEDDING_DIMENSIONS;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  private ensureClient(): GoogleGenAI {
    if (!this.client) {
      if (env.GEMINI_API_KEY) {
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } else {
        throw new InternalServerError("GEMINI_API_KEY is not configured.");
      }
    }
    return this.client;
  }

  async generate(prompt: string, options?: LlmGenerateOptions): Promise<LlmGenerateResult> {
    const ai = this.ensureClient();

    const config: Record<string, unknown> = {
      temperature: options?.temperature ?? AI_CONSTANTS.TEMPERATURE_GENERATION,
    };
    if (options?.maxOutputTokens) config.maxOutputTokens = options.maxOutputTokens;
    if (options?.systemInstruction) config.systemInstruction = options.systemInstruction;

    const response = await ai.models.generateContent({
      model: this.llmModel,
      contents: prompt,
      config,
    });

    return {
      text: response.text ?? "",
      promptTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      model: this.llmModel,
    };
  }

  async generateStructured<T>(
    prompt: string,
    schema: Record<string, unknown>,
    options?: LlmGenerateOptions
  ): Promise<LlmGenerateResult<T>> {
    const ai = this.ensureClient();

    const config: Record<string, unknown> = {
      temperature: options?.temperature ?? AI_CONSTANTS.TEMPERATURE_GENERATION,
      responseMimeType: "application/json",
      responseSchema: schema,
    };
    if (options?.maxOutputTokens) config.maxOutputTokens = options.maxOutputTokens;
    if (options?.systemInstruction) config.systemInstruction = options.systemInstruction;

    const response = await ai.models.generateContent({
      model: this.llmModel,
      contents: prompt,
      config,
    });

    const text = response.text ?? "{}";
    try {
      const data = JSON.parse(text) as T;
      return {
        text,
        data,
        promptTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        model: this.llmModel,
      };
    } catch {
      throw new InternalServerError("Failed to parse structured JSON response from Gemini model.");
    }
  }

  async *stream(prompt: string, options?: LlmGenerateOptions): AsyncGenerator<string, void, unknown> {
    const ai = this.ensureClient();

    const config: Record<string, unknown> = {
      temperature: options?.temperature ?? AI_CONSTANTS.TEMPERATURE_EXPLANATION,
    };
    if (options?.systemInstruction) config.systemInstruction = options.systemInstruction;

    const streamResponse = await ai.models.generateContentStream({
      model: this.llmModel,
      contents: prompt,
      config,
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) yield chunk.text;
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    const results = await this.embedWithCache([text], "RETRIEVAL_QUERY", AI_CONSTANTS.EMBEDDING_QUERY_CACHE_TTL);
    const vector = results[0];
    if (!vector) throw new InternalServerError("Failed to generate embedding for query.");
    return vector;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    return this.embedWithCache(texts, "RETRIEVAL_DOCUMENT", AI_CONSTANTS.EMBEDDING_DOC_CACHE_TTL);
  }

  private async embedWithCache(
    texts: string[],
    taskType: EmbeddingTaskType,
    cacheTtlSeconds: number
  ): Promise<number[][]> {
    const finalVectors: number[][] = new Array<number[]>(texts.length);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    // Check Redis cache first to save quota
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i] ?? "";
      const cacheKey = RedisKeys.ai.embeddingCache(sha256(`${taskType}:${text}`));
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          finalVectors[i] = JSON.parse(cached) as number[];
          continue;
        }
      } catch {
        // Cache read failure is non-fatal
      }
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }

    // Batch fetch cache misses in chunks of 100
    if (uncachedTexts.length > 0) {
      const batchSize = AI_CONSTANTS.EMBEDDING_BATCH_SIZE;

      for (let start = 0; start < uncachedTexts.length; start += batchSize) {
        const batchTexts = uncachedTexts.slice(start, start + batchSize);
        const batchIndices = uncachedIndices.slice(start, start + batchSize);

        const vectors = await this.callGeminiEmbed(batchTexts, taskType);

        for (let j = 0; j < vectors.length; j++) {
          const vector = vectors[j];
          const originalIndex = batchIndices[j];
          const text = batchTexts[j];

          if (vector && originalIndex !== undefined && text !== undefined) {
            finalVectors[originalIndex] = vector;
            const cacheKey = RedisKeys.ai.embeddingCache(sha256(`${taskType}:${text}`));
            redis.set(cacheKey, JSON.stringify(vector), "EX", cacheTtlSeconds).catch(() => {});
          }
        }
      }
    }

    return finalVectors;
  }

  private async callGeminiEmbed(texts: string[], taskType: EmbeddingTaskType): Promise<number[][]> {
    const ai = this.ensureClient();
    const results: number[][] = [];

    for (const text of texts) {
      const response = await ai.models.embedContent({
        model: this.embeddingModel,
        contents: text,
        config: {
          taskType,
          outputDimensionality: this.dimensions,
        },
      });

      let values: number[] = [];
      const rawObj = response as unknown as {
        embedding?: { values?: number[] };
        embeddings?: Array<{ values?: number[] }>;
      };
      const rawValues = rawObj.embedding?.values ?? rawObj.embeddings?.[0]?.values;
      if (Array.isArray(rawValues)) {
        values = rawValues;
      }

      // MRL truncation safeguard for pgvector vector(768)
      if (values.length > this.dimensions) {
        values = values.slice(0, this.dimensions);
      }

      results.push(values);
    }

    return results;
  }
}
