import Link from "next/link";
import type { Settings } from "@/lib/types";
import { WhatsAppButton } from "./WhatsAppButton";

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Nosotros" },
  { href: "/products", label: "Productos" },
  { href: "/delivery", label: "Entregas y pedidos" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contact", label: "Contacto" },
];

export function Header({ settings }: { settings: Settings }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center gap-2 font-bold text-brand-700 sm:text-lg"
        >
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-white"
          >
            {settings.companyName.charAt(0)}
          </span>
          <span className="truncate">{settings.companyName}</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <WhatsAppButton
            phone={settings.whatsappNumber}
            message="Hola, quisiera información sobre sus productos."
            label="WhatsApp"
            className="text-sm"
          />
        </div>

        {/* Mobile menu without JavaScript */}
        <details className="group relative shrink-0 lg:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-brand-100 px-3 font-medium [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menú</span>
            <span className="hidden group-open:inline">Cerrar</span>
          </summary>
          <nav
            aria-label="Menú móvil"
            className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-brand-100 bg-white p-2 shadow-xl"
          >
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center rounded-md px-3 text-ink hover:bg-brand-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
