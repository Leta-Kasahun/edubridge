export interface ImageVariantOptions {
  readonly width?: number;
  readonly height?: number;
  readonly crop?: "fill" | "thumb" | "scale" | "fit" | "limit" | "pad";
  readonly quality?: "auto" | number | string;
  readonly format?: "auto" | "webp" | "jpg" | "png";
}

export function injectCloudinaryTransformations(
  secureUrl: string,
  transformations: readonly string[]
): string {
  if (!secureUrl.includes("res.cloudinary.com") || transformations.length === 0) {
    return secureUrl;
  }

  const uploadSegment = "/upload/";
  const uploadIndex = secureUrl.indexOf(uploadSegment);
  if (uploadIndex === -1) {
    return secureUrl;
  }

  const prefix = secureUrl.substring(0, uploadIndex + uploadSegment.length);
  const suffix = secureUrl.substring(uploadIndex + uploadSegment.length);
  const transformString = transformations.join(",");

  return `${prefix}${transformString}/${suffix}`;
}

export function buildCloudinaryThumbnailUrl(
  secureUrl: string,
  width = 300,
  height = 200
): string {
  return injectCloudinaryTransformations(secureUrl, [
    `w_${width}`,
    `h_${height}`,
    "c_fill",
    "q_auto",
    "f_auto",
  ]);
}

export function buildVideoPosterUrl(
  videoSecureUrl: string,
  width = 640,
  height = 360
): string {
  const jpgUrl = videoSecureUrl.replace(/\.[^/.]+$/, ".jpg");
  return injectCloudinaryTransformations(jpgUrl, [
    `w_${width}`,
    `h_${height}`,
    "c_fill",
    "so_0",
    "q_auto",
    "f_auto",
  ]);
}

export function buildResponsiveImageVariants(
  secureUrl: string,
  widths: readonly number[] = [320, 640, 960, 1280]
): readonly { readonly width: number; readonly url: string }[] {
  return widths.map((w) => ({
    width: w,
    url: injectCloudinaryTransformations(secureUrl, [
      `w_${w}`,
      "c_scale",
      "q_auto",
      "f_auto",
    ]),
  }));
}
