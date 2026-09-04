export interface ImageVariantOptions {
  readonly width?: number;
  readonly height?: number;
  readonly crop?: "fill" | "thumb" | "scale" | "fit" | "limit" | "pad";
  readonly quality?: "auto" | number | string;
  readonly format?: "auto" | "webp" | "jpg" | "png";
}

export function buildMediaDeliveryUrl(
  baseUrl: string,
  _options?: ImageVariantOptions
): string {
  return baseUrl;
}

export function buildVideoPosterUrl(videoUrl: string): string {
  return videoUrl.replace(/\.[^/.]+$/, ".jpg");
}
