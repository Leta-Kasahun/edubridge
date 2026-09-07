import { extractText } from "unpdf";
import { IOcrProvider } from "./ocr-provider.interface.js";
import { TesseractOcrProvider } from "./tesseract-ocr.provider.js";
import {
  DocumentExtractor,
  ExtractedDocument,
  ExtractedPage,
  ExtractedBlock,
} from "./extraction.types.js";

export class DocumentExtractorLib implements DocumentExtractor {
  constructor(
    private readonly ocrProvider: IOcrProvider = new TesseractOcrProvider()
  ) {}

  async extract(
    buffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<ExtractedDocument> {
    if (mimeType.startsWith("image/")) {
      const text = await this.ocrProvider.recognizeText(buffer);
      const blocks: ExtractedBlock[] = this.parseTextIntoBlocks(text);
      return {
        filename,
        mimeType,
        pageCount: 1,
        isScanned: true,
        fullText: text,
        pages: [
          {
            pageNumber: 1,
            hasSelectableText: false,
            text,
            blocks,
          },
        ],
      };
    }

    try {
      const result = await extractText(new Uint8Array(buffer), {
        mergePages: false,
      });

      const rawPages = Array.isArray(result.text)
        ? result.text
        : [result.text || ""];
      const totalPages = result.totalPages || rawPages.length || 1;
      const pages: ExtractedPage[] = [];
      let isScannedDoc = false;

      for (let i = 0; i < totalPages; i++) {
        const pageText = (rawPages[i] || "").trim();
        const hasSelectableText = pageText.length > 20;

        if (!hasSelectableText) {
          isScannedDoc = true;
        }

        const blocks = this.parseTextIntoBlocks(pageText);
        pages.push({
          pageNumber: i + 1,
          hasSelectableText,
          text: pageText,
          blocks,
        });
      }

      let fullText = pages.map((p) => p.text).join("\n\n");
      if (fullText.trim().length === 0) {
        isScannedDoc = true;
        const ocrText = await this.ocrProvider.recognizeText(buffer);
        if (ocrText.trim().length > 0) {
          fullText = ocrText;
          pages[0] = {
            pageNumber: 1,
            hasSelectableText: false,
            text: ocrText,
            blocks: this.parseTextIntoBlocks(ocrText),
          };
        }
      }

      return {
        filename,
        mimeType,
        pageCount: totalPages,
        isScanned: isScannedDoc,
        pages,
        fullText,
      };
    } catch {
      const text = await this.ocrProvider.recognizeText(buffer);
      const blocks = this.parseTextIntoBlocks(text);
      return {
        filename,
        mimeType,
        pageCount: 1,
        isScanned: true,
        fullText: text,
        pages: [
          {
            pageNumber: 1,
            hasSelectableText: false,
            text,
            blocks,
          },
        ],
      };
    }
  }

  private parseTextIntoBlocks(text: string): ExtractedBlock[] {
    if (!text || text.trim().length === 0) return [];
    return text
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0)
      .map((block, idx) => ({
        text: block,
        orderIndex: idx + 1,
      }));
  }
}
