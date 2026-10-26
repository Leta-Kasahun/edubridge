/**
 * Core AI abstraction interfaces for LLM generation and Vector Embeddings.
 * Decouples consumer modules from specific model vendors.
 */

export interface LlmGenerateOptions {
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly systemInstruction?: string;
  readonly responseSchema?: Record<string, unknown>;
  readonly responseMimeType?: string;
}

export interface LlmGenerateResult<T = unknown> {
  readonly text: string;
  readonly data?: T;
  readonly promptTokens?: number;
  readonly outputTokens?: number;
  readonly model: string;
}

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export interface EmbedOptions {
  readonly taskType?: EmbeddingTaskType;
  readonly title?: string;
}

export interface ILlmProvider {
  generate(prompt: string, options?: LlmGenerateOptions): Promise<LlmGenerateResult>;
  generateStructured<T>(
    prompt: string,
    schema: Record<string, unknown>,
    options?: LlmGenerateOptions
  ): Promise<LlmGenerateResult<T>>;
  stream(prompt: string, options?: LlmGenerateOptions): AsyncGenerator<string, void, unknown>;
}

export interface IEmbeddingProvider {
  embedQuery(text: string): Promise<number[]>;
  embedDocuments(texts: string[]): Promise<number[][]>;
}
