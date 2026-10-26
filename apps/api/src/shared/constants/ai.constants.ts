import { env } from "../../config/env.js";

/**
 * AI & RAG Configuration Constants
 * Centralized settings for chunk boundaries, search thresholds, caching TTLs, and rate limits.
 */
export const AI_CONSTANTS = {
  // Token chunk boundaries (Semantic Strategy for digital documents)
  SEMANTIC_MAX_TOKENS: env.RAG_CHUNK_MAX_TOKENS,
  SEMANTIC_OVERLAP_TOKENS: env.RAG_CHUNK_OVERLAP_TOKENS,
  SEMANTIC_MIN_TOKENS: env.RAG_MIN_CHUNK_TOKENS,

  // Token chunk boundaries (Fixed Sliding Strategy for scanned/OCR documents)
  FIXED_MAX_TOKENS: 384,
  FIXED_OVERLAP_TOKENS: 96,
  FIXED_MIN_TOKENS: 30,

  // Hybrid Search parameters
  HYBRID_TOP_K: env.RAG_HYBRID_TOP_K,
  VECTOR_SEARCH_K: env.RAG_VECTOR_SEARCH_K,
  FULLTEXT_SEARCH_K: env.RAG_FULLTEXT_SEARCH_K,
  RRF_K: 60, // Standard Reciprocal Rank Fusion constant

  // Embedding dimensions (gemini-embedding-001 MRL truncated to 768)
  EMBEDDING_DIMENSIONS: env.GEMINI_EMBEDDING_DIMENSIONS,
  EMBEDDING_BATCH_SIZE: 100,

  // Cache TTLs in seconds
  EMBEDDING_DOC_CACHE_TTL: env.AI_EMBEDDING_DOC_CACHE_TTL,
  EMBEDDING_QUERY_CACHE_TTL: env.AI_EMBEDDING_QUERY_CACHE_TTL,
  EXPLANATION_CACHE_TTL: env.AI_EXPLANATION_CACHE_TTL,

  // Rate Limiting (window in seconds)
  RATE_LIMIT_WINDOW_SECONDS: 3600, // 1 hour sliding window
  MAX_GENERATION_RPH: env.AI_MAX_GENERATION_RPH,
  MAX_EXPLANATION_RPH: env.AI_MAX_EXPLANATION_RPH,

  // LLM Generation temperatures
  TEMPERATURE_GENERATION: 0.3,
  TEMPERATURE_EXPLANATION: 0.5,
} as const;
