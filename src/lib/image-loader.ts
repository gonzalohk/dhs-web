// next/image loader (configured in next.config.ts). Cloudinary public ids are delivered as
// AVIF/WebP with automatic quality; local files (paths starting with "/") are served as-is.
type LoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: LoaderProps): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
  if (src.startsWith("/") || !cloud) return `${src}?w=${width}`;
  const q = quality ? `q_${quality}` : "q_auto";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,${q},w_${width},c_limit/${src}`;
}
