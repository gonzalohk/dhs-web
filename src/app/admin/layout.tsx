import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "./actions";

// Staff pages depend on the signed-in session, so they are never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Área de personal",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/company", label: "Datos de la empresa" },
  { href: "/admin/texts", label: "Textos" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/faqs", label: "Preguntas frecuentes" },
  { href: "/admin/testimonials", label: "Testimonios" },
  { href: "/admin/history", label: "Historial" },
  { href: "/admin/inquiries", label: "Consultas" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Área de personal" className="mb-8 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex min-h-11 items-center rounded-full border border-brand-100 px-4 text-sm font-medium hover:bg-brand-50"
          >
            {l.label}
          </Link>
        ))}
        <form action={signOut}>
          <button className="min-h-11 rounded-full border border-gray-400 px-4 text-sm">
            Cerrar sesión
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
