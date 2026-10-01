import Link from "next/link";
import { formatBoPhone } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { navLinks } from "./Header";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-16 bg-brand-800 pb-24 text-brand-50 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{settings.companyName}</p>
          <p className="mt-2 text-sm">{settings.tagline}</p>
        </div>
        <address className="text-sm not-italic">
          <p className="font-semibold text-white">Contacto</p>
          <p className="mt-2">
            {settings.address}, {settings.city}, Bolivia
          </p>
          <p className="mt-1">
            <a href={`tel:${settings.phone}`} className="underline-offset-2 hover:underline">
              {formatBoPhone(settings.phone)}
            </a>
          </p>
          <p className="mt-1">
            <a href={`mailto:${settings.email}`} className="underline-offset-2 hover:underline">
              {settings.email}
            </a>
          </p>
          <p className="mt-1">{settings.businessHours}</p>
        </address>
        <nav aria-label="Pie de página" className="text-sm">
          <p className="font-semibold text-white">Secciones</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center underline-offset-2 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact#privacidad"
                className="inline-flex min-h-11 items-center underline-offset-2 hover:underline"
              >
                Privacidad
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-brand-700 px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} {settings.companyName}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
