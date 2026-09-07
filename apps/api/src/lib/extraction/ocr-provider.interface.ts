export interface IOcrProvider {
  readonly name: string;
  recognizeText(imageBuffer: Buffer): Promise<string>;
}
