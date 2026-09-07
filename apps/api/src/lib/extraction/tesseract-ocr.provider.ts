import { createWorker } from "tesseract.js";
import { IOcrProvider } from "./ocr-provider.interface.js";

export class TesseractOcrProvider implements IOcrProvider {
  readonly name = "TESSERACT";

  async recognizeText(imageBuffer: Buffer): Promise<string> {
    try {
      const worker = await createWorker("eng");
      try {
        const { data } = await worker.recognize(imageBuffer);
        return data.text || "";
      } finally {
        await worker.terminate();
      }
    } catch {
      return "";
    }
  }
}
