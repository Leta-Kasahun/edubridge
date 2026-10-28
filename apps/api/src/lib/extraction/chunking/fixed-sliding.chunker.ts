import { get_encoding } from "tiktoken";
import { AI_CONSTANTS } from "../../../shared/constants/ai.constants.js";
import type { IChunkStrategy, ChunkResult, ChunkOptions } from "./chunk-strategy.interface.js";

export class FixedSlidingChunker implements IChunkStrategy {
  chunk(text: string, options?: ChunkOptions): ChunkResult[] {
    const maxTokens = options?.maxTokens ?? AI_CONSTANTS.FIXED_MAX_TOKENS;
    const overlapTokens = options?.overlapTokens ?? AI_CONSTANTS.FIXED_OVERLAP_TOKENS;
    const minTokens = options?.minTokens ?? AI_CONSTANTS.FIXED_MIN_TOKENS;

    const enc = get_encoding("cl100k_base");
    const decoder = new TextDecoder();
    const results: ChunkResult[] = [];

    try {
      const tokens = enc.encode(text);
      const totalTokens = tokens.length;
      const stride = Math.max(1, maxTokens - overlapTokens);

      for (let start = 0; start < totalTokens; start += stride) {
        const end = Math.min(start + maxTokens, totalTokens);
        const slice = tokens.slice(start, end);

        if (slice.length >= minTokens) {
          const chunkText = decoder.decode(enc.decode(slice));
          const pageNumber = Math.max(1, Math.floor(start / 700) + 1);

          results.push({
            text: chunkText,
            tokenCount: slice.length,
            metadata: {
              headingPath: [],
              pageNumber,
              sectionTitle: "",
              strategy: "fixed_sliding",
            },
          });
        }
      }
    } finally {
      enc.free(); // Release WebAssembly allocation
    }

    return results;
  }
}
