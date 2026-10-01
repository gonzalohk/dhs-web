// Image rules and helpers, independent of Next.js so they can be unit tested.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const IMAGE_BUCKET = "site-images";

export type ImageEntity = "categories" | "products";

/** Returns a Spanish error message, or null when the file is acceptable. */
export function validateImage(file: { type: string; size: number }): string | null {
  if (!(file.type in IMAGE_TYPES)) {
    return "El archivo debe ser una imagen JPG, PNG, WebP o AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "La imagen es demasiado grande. El máximo es 5 MB.";
  }
  return null;
}

/** Storage object path: `<entity>/<id>.<ext>`. */
export function buildImagePath(entity: ImageEntity, mimeType: string, id: string): string {
  const ext = IMAGE_TYPES[mimeType];
  if (!ext) throw new Error(`Unsupported image type: ${mimeType}`);
  return `${entity}/${id}.${ext}`;
}

/**
 * Public URL for an image path. Local files (paths starting with "/") are used as they are;
 * Supabase Storage paths are resolved against the public bucket URL. Server-side only
 * (reads SUPABASE_URL); pages pass the resolved URL to client components.
 */
export function storagePublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
