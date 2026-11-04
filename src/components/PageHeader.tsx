import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

type Props = {
  title: string;
  intro?: string | null;
  breadcrumb?: { name: string; href: string }[];
  /**
   * Header background photo (served from /public). Defaults to the vegetable basket. Pass null
   * to show only the fruit watermark (no photo).
   */
  image?: string | null;
  /** object-position for the photo (e.g. "right center", "center"). */
  imagePosition?: string;
};

/**
 * Page title (the page's only h1) with a short introduction and optional breadcrumb, in the
 * Foody page-header style: a light band with the fruit watermark and a faded vegetable photo on
 * the right. Swap public/foody/carousel-2.jpg to change the photo.
 */
export function PageHeader({
  title,
  intro,
  breadcrumb,
  image = "/foody/carousel-1.jpg",
  imagePosition = "right center",
}: Props) {
  const hasPhoto = Boolean(image);
  return (
    <div
      className={`relative isolate flex min-h-[24rem] items-center overflow-hidden bg-brand-50 ${
        hasPhoto ? "" : "bg-veg"
      }`}
    >
      {/* With a photo: full-strength image (no dimming), and the title stays readable with a soft
          white halo. Without one (image=null): just the fruit watermark on the light band. */}
      {hasPhoto && (
        <Image
          src={image as string}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: imagePosition }}
          className="-z-10 object-cover"
        />
      )}

      <div className={`mx-auto w-full max-w-6xl px-4 py-10 ${hasPhoto ? "text-halo" : ""}`}>
        {breadcrumb && (
          <nav aria-label="Ruta de navegación" className="mb-3 text-sm text-muted">
            <ol className="flex flex-wrap gap-1">
              {breadcrumb.map((item) => (
                <li key={item.href} className="after:ml-1 after:content-['/']">
                  <Link href={item.href} className="underline-offset-2 hover:underline">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Reveal stagger className="section-bars section-bars--start">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-800 sm:text-4xl">
            {title}
          </h1>
          {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
        </Reveal>
      </div>
    </div>
  );
}
