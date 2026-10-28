import { get_encoding } from "tiktoken";
import { AI_CONSTANTS } from "../../../shared/constants/ai.constants.js";
import type { IChunkStrategy, ChunkResult, ChunkOptions } from "./chunk-strategy.interface.js";

const HEADING_REGEX = /^(?:#{1,4}\s+|(?:\d+\.)+\d*\s+[A-Z]|(?:Chapter|Unit|Section)\s+\d+|[IVXLCDM]+\.\s+[A-Z]|[A-Z][A-Z\s]{4,})$/m;

export class SemanticBoundaryChunker implements IChunkStrategy {
  chunk(text: string, options?: ChunkOptions): ChunkResult[] {
    const maxTokens = options?.maxTokens ?? AI_CONSTANTS.SEMANTIC_MAX_TOKENS;
    const overlapTokens = options?.overlapTokens ?? AI_CONSTANTS.SEMANTIC_OVERLAP_TOKENS;
    const minTokens = options?.minTokens ?? AI_CONSTANTS.SEMANTIC_MIN_TOKENS;

    const enc = get_encoding("cl100k_base");
    const decoder = new TextDecoder();
    const results: ChunkResult[] = [];

    try {
      const sections = this.splitIntoSections(text);
      let cumulativeCharOffset = 0;

      for (const section of sections) {
        const tokens = enc.encode(section.content);
        const sectionTokensCount = tokens.length;
        const pageNumber = Math.max(1, Math.floor(cumulativeCharOffset / 3000) + 1);

        // Emit intact if section fits within maxTokens
        if (sectionTokensCount <= maxTokens) {
          if (sectionTokensCount >= minTokens) {
            results.push({
              text: section.content,
              tokenCount: sectionTokensCount,
              metadata: {
                headingPath: section.headingPath,
                pageNumber,
                sectionTitle: section.title,
                strategy: "semantic_boundary",
              },
            });
          }
        } else {
          // Slide window within the oversized section
          const stride = maxTokens - overlapTokens;
          for (let start = 0; start < sectionTokensCount; start += stride) {
            const end = Math.min(start + maxTokens, sectionTokensCount);
            const slice = tokens.slice(start, end);

            if (slice.length >= minTokens) {
              const chunkText = decoder.decode(enc.decode(slice));
              results.push({
                text: chunkText,
                tokenCount: slice.length,
                metadata: {
                  headingPath: section.headingPath,
                  pageNumber,
                  sectionTitle: section.title,
                  strategy: "semantic_boundary",
                },
              });
            }
          }
        }
        cumulativeCharOffset += section.content.length;
      }
    } finally {
      enc.free(); // Release WebAssembly allocation
    }

    return results;
  }

  private splitIntoSections(text: string): Array<{ title: string; headingPath: string[]; content: string }> {
    const lines = text.split("\n");
    const sections: Array<{ title: string; headingPath: string[]; content: string }> = [];

    let currentTitle = "Introduction";
    let currentPath: string[] = ["Introduction"];
    let currentLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (HEADING_REGEX.test(trimmed)) {
        if (currentLines.length > 0) {
          sections.push({
            title: currentTitle,
            headingPath: [...currentPath],
            content: currentLines.join("\n").trim(),
          });
          currentLines = [];
        }
        currentTitle = trimmed;
        currentPath = [trimmed];
      }
      currentLines.push(line);
    }

    if (currentLines.length > 0) {
      sections.push({
        title: currentTitle,
        headingPath: [...currentPath],
        content: currentLines.join("\n").trim(),
      });
    }

    return sections.filter((s) => s.content.length > 0);
  }
}
