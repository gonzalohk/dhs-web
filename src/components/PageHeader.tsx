import Link from "next/link";

type Props = {
  title: string;
  intro?: string | null;
  breadcrumb?: { name: string; href: string }[];
};

/** Page title (the page's only h1) with a short introduction and optional breadcrumb. */
export function PageHeader({ title, intro, breadcrumb }: Props) {
  return (
    <div className="bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
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
        <h1 className="text-3xl font-bold tracking-tight text-brand-800 sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>}
      </div>
    </div>
  );
}
