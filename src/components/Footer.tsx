import Link from "next/link";
import { COMPANY_FULL_NAME } from "@/lib/brand";
import { addressLine, formatBoPhone } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { navLinks } from "./Header";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";
import { Logo } from "./Logo";

const row = "flex min-h-11 items-start gap-3 py-2";
const icon = "mt-0.5 size-5 shrink-0 text-accent-400";

export function Footer({ settings }: { settings: Settings }) {
  const address = addressLine(settings);
  return (
    <footer className="mt-16 border-t-4 border-accent-500 bg-brand-800 pb-24 text-brand-50 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 sm:px-4 lg:grid-cols-3">
        {/* Brand: centered on phones, left-aligned from 640 px */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <Logo variant="footer" name={settings.companyName} />
          <p className="mt-5 text-lg font-bold text-white">{settings.companyName}</p>
          <p className="text-sm text-brand-100">{COMPANY_FULL_NAME}</p>
          {settings.tagline && <p className="mt-2 max-w-xs text-sm">{settings.tagline}</p>}
        </div>

        {/* Contact: tappable rows with icons; a soft card on phones */}
        <address className="rounded-2xl bg-brand-900/60 px-5 py-4 text-sm not-italic sm:bg-transparent sm:p-0">
          <p className="mb-1 font-semibold tracking-wide text-white uppercase">Contacto</p>
          <ul className="divide-y divide-brand-700 sm:divide-y-0">
            <li>
              <a href={`tel:${settings.phone}`} className={`${row} hover:underline`}>
                <PhoneIcon className={icon} />
                {formatBoPhone(settings.phone)}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className={`${row} hover:underline`}>
                <MailIcon className={icon} />
                <span className="break-all">{settings.email}</span>
              </a>
            </li>
            {address && (
              <li className={row}>
                <PinIcon className={icon} />
                <span>{address}</span>
              </li>
            )}
            {settings.businessHours && (
              <li className={row}>
                <ClockIcon className={icon} />
                <span>{settings.businessHours}</span>
              </li>
            )}
          </ul>
        </address>

        {/* Sections: two columns of large tap targets */}
        <nav aria-label="Pie de página" className="text-sm sm:col-span-2 lg:col-span-1">
          <p className="mb-1 font-semibold tracking-wide text-white uppercase">Secciones</p>
          <ul className="grid grid-cols-2 gap-x-4">
            {[...navLinks, { href: "/contact#privacidad", label: "Privacidad" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-brand-700 px-4 py-4 text-center text-xs text-brand-100">
        © {new Date().getFullYear()} {settings.companyName}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
