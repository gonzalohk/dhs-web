"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/app/admin/actions";
import { ADMIN_NAV, findNavItem, type NavIcon } from "@/lib/admin-nav";

const svg = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-5 shrink-0"
  >
    {children}
  </svg>
);

const ICONS: Record<NavIcon, ReactNode> = {
  home: svg(
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>,
  ),
  building: svg(
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>,
  ),
  text: svg(
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>,
  ),
  help: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
    </>,
  ),
  quote: svg(
    <>
      <path d="M5 6h6v6H8a3 3 0 0 0 3 3M14 6h6v6h-3a3 3 0 0 0 3 3" />
    </>,
  ),
  tag: svg(
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12Z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </>,
  ),
  box: svg(
    <>
      <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
      <path d="m3 7 9 4 9-4M12 11v10" />
    </>,
  ),
  inbox: svg(
    <>
      <path d="M3 13h5l1 3h6l1-3h5" />
      <path d="M5 5h14l2 8v6H3v-6l2-8Z" />
    </>,
  ),
  clock: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
  ),
};

/**
 * Staff navigation. Desktop (1024 px and up): a sticky sidebar with grouped sections and icons.
 * Phones and tablets: a bar showing the current section with a menu button that opens the same list.
 */
export function AdminNav() {
  const pathname = usePathname();
  // The phone menu is open for one specific path, so navigating to another page closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const current = findNavItem(pathname);

  if (pathname === "/admin/login") return null;

  const list = (
    <div className="space-y-5">
      {ADMIN_NAV.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-xs font-semibold tracking-wider text-muted uppercase">
            {group.title}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const active = current?.href === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand-700 text-white shadow-sm"
                        : "text-brand-800 hover:bg-brand-100"
                    }`}
                  >
                    {ICONS[item.icon]}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <form action={signOut} className="border-t border-brand-100 pt-4">
        <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted hover:bg-brand-100 hover:text-brand-800">
          {svg(
            <>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </>,
          )}
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <nav aria-label="Área de personal" className="mb-6 lg:mb-0">
      {/* Phones and tablets */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpenPath(open ? null : pathname)}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 text-left shadow-sm"
        >
          <span className="flex items-center gap-3 font-semibold text-brand-800">
            {current ? ICONS[current.icon] : ICONS.home}
            {current?.label ?? "Panel del personal"}
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            Menú
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {open && (
          <div
            id="admin-menu"
            className="mt-2 rounded-xl border border-brand-100 bg-white p-3 shadow-lg"
          >
            {list}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="sticky top-24 hidden rounded-2xl border border-brand-100 bg-white p-3 shadow-sm lg:block">
        <p className="px-3 pb-3 text-sm font-bold text-brand-800">Panel del personal</p>
        {list}
      </div>
    </nav>
  );
}
