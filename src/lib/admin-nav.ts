// Structure of the staff navigation: sections grouped by what staff do with them.

export type NavIcon =
  "home" | "building" | "text" | "help" | "quote" | "tag" | "box" | "inbox" | "clock";

export type NavItem = { href: string; label: string; icon: NavIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { title: "General", items: [{ href: "/admin", label: "Panel", icon: "home" }] },
  {
    title: "Sitio web",
    items: [
      { href: "/admin/company", label: "Datos de la empresa", icon: "building" },
      { href: "/admin/texts", label: "Textos de las páginas", icon: "text" },
      { href: "/admin/faqs", label: "Preguntas frecuentes", icon: "help" },
      { href: "/admin/testimonials", label: "Testimonios", icon: "quote" },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/categories", label: "Categorías", icon: "tag" },
      { href: "/admin/products", label: "Productos", icon: "box" },
    ],
  },
  {
    title: "Actividad",
    items: [
      { href: "/admin/inquiries", label: "Consultas", icon: "inbox" },
      { href: "/admin/history", label: "Historial de cambios", icon: "clock" },
    ],
  },
];

/** The nav item for a path (the panel only matches exactly; the others match their sub-paths too). */
export function findNavItem(pathname: string): NavItem | undefined {
  return ADMIN_NAV.flatMap((g) => g.items).find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
