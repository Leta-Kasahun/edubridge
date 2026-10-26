import type { IChunkStrategy } from "./chunk-strategy.interface.js";
import { SemanticBoundaryChunker } from "./semantic-boundary.chunker.js";
import { FixedSlidingChunker } from "./fixed-sliding.chunker.js";

const semanticChunker = new SemanticBoundaryChunker();
const fixedChunker = new FixedSlidingChunker();

export function selectChunkStrategy(isScanned: boolean): IChunkStrategy {
  return isScanned ? fixedChunker : semanticChunker;
}
