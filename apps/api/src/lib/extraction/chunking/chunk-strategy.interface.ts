export interface ChunkMetadata {
  readonly headingPath: string[];
  readonly pageNumber: number;
  readonly sectionTitle: string;
  readonly strategy: "semantic_boundary" | "fixed_sliding";
}

export interface ChunkResult {
  readonly text: string;
  readonly tokenCount: number;
  readonly metadata: ChunkMetadata;
}

export interface ChunkOptions {
  readonly maxTokens?: number;
  readonly overlapTokens?: number;
  readonly minTokens?: number;
}

export interface IChunkStrategy {
  chunk(text: string, options?: ChunkOptions): ChunkResult[];
}
