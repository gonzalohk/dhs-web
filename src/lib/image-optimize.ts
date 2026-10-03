// Optimizes an image in the browser BEFORE it is uploaded, so the server stores and serves small files:
// photos are scaled down to at most MAX_DIMENSION px on the longest side and re-encoded as WebP.
// Pure sizing logic is separate (and unit tested); the canvas work only runs in the browser.

/** Longest side of a stored image. Cards show images at under 740 px, so 1600 px covers retina screens. */
export const MAX_DIMENSION = 1600;
export const WEBP_QUALITY = 0.82;
/** Original files up to this size can be chosen; they are compressed before upload. */
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

/** Scales (width, height) down to fit within `max` on the longest side; never enlarges. */
export function fitWithin(
  width: number,
  height: number,
  max = MAX_DIMENSION,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** The file name with a .webp extension. */
export function webpName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "") || "imagen"}.webp`;
}

export type OptimizedImage = { file: File; originalBytes: number; optimizedBytes: number };

/**
 * Returns a smaller WebP version of the image. If the image cannot be decoded or the result would not be
 * smaller than the original, the original file is returned unchanged.
 */
export async function optimizeImage(file: File): Promise<OptimizedImage> {
  const unchanged = { file, originalBytes: file.size, optimizedBytes: file.size };
  try {
    const bitmap = await createImageBitmap(file); // applies the photo's EXIF rotation
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return unchanged;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return unchanged;
    const optimized = new File([blob], webpName(file.name), { type: "image/webp" });
    return { file: optimized, originalBytes: file.size, optimizedBytes: optimized.size };
  } catch {
    return unchanged;
  }
}

/** "3,2 MB" / "180 KB" for messages. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
