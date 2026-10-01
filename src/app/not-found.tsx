import Link from "next/link";
import { navLinks } from "@/components/Header";

export const metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="font-semibold text-brand-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-800">No encontramos esta página</h1>
      <p className="mt-3 text-muted">
        Puede que la dirección haya cambiado. Estas secciones pueden ayudarle:
      </p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-full border border-brand-100 px-4 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
