export interface ExtractedBlock {
  text: string;
  orderIndex: number;
  confidence?: number;
}

export interface ExtractedPage {
  pageNumber: number;
  hasSelectableText: boolean;
  text: string;
  blocks: ExtractedBlock[];
}

export interface ExtractedDocument {
  filename: string;
  mimeType: string;
  pageCount: number;
  pages: ExtractedPage[];
  fullText: string;
  isScanned: boolean;
}

export interface DocumentExtractor {
  extract(buffer: Buffer, mimeType: string, filename: string): Promise<ExtractedDocument>;
}
