import Link from "next/link";
import { itemName } from "@/lib/content-admin";
import { getRawSettings } from "@/lib/content";
import { requireStaff } from "@/lib/staff-session";
import { isPlaceholder } from "@/lib/tokens";
import type { Settings } from "@/lib/types";

const FIELD_LABELS: Partial<Record<keyof Settings, string>> = {
  tagline: "Frase de la empresa",
  story: "Historia",
  mission: "Misión",
  values: "Valores",
  address: "Dirección",
  city: "Ciudad",
  businessHours: "Horario de atención",
  deliverySchedule: "Días y horarios de entrega",
  minimumOrder: "Pedido mínimo",
  serviceAreas: "Zonas de entrega",
  orderingSteps: "Pasos para ser cliente",
  certifications: "Certificaciones",
  clientTypes: "Tipos de clientes",
};

const SECTIONS = [
  {
    href: "/admin/company",
    title: "Datos de la empresa",
    text: "Nombre, teléfono, WhatsApp, correo, dirección y más.",
  },
  {
    href: "/admin/texts",
    title: "Textos de las páginas",
    text: "Titulares e introducciones de cada página.",
  },
  {
    href: "/admin/categories",
    title: "Categorías",
    text: "Agregar, ordenar, ocultar y cambiar imágenes.",
  },
  { href: "/admin/products", title: "Productos", text: "Precios, unidades e imágenes." },
  {
    href: "/admin/faqs",
    title: "Preguntas frecuentes",
    text: "Respuestas a las dudas más comunes.",
  },
  { href: "/admin/testimonials", title: "Testimonios", text: "Opiniones reales de clientes." },
  {
    href: "/admin/history",
    title: "Historial",
    text: "Revise cambios y restaure el valor anterior.",
  },
  { href: "/admin/inquiries", title: "Consultas", text: "Mensajes recibidos por el formulario." },
];

export default async function AdminDashboard() {
  const { supabase } = await requireStaff();
  const [settings, changes] = await Promise.all([
    getRawSettings(),
    supabase.from("content_changes").select("*").order("changed_at", { ascending: false }).limit(5),
  ]);

  const pending = (Object.keys(FIELD_LABELS) as (keyof Settings)[]).filter((key) => {
    const value = settings[key];
    return Array.isArray(value)
      ? value.some(isPlaceholder) || value.length === 0
      : isPlaceholder(value as string);
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Panel del personal</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block h-full rounded-2xl border border-brand-100 p-5 hover:bg-brand-50"
            >
              <p className="font-semibold text-brand-800">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="pending-title" className="mt-10">
        <h2 id="pending-title" className="text-xl font-bold text-brand-800">
          Datos pendientes
        </h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-muted">No hay datos pendientes.</p>
        ) : (
          <>
            <p className="mt-2 max-w-2xl text-muted">
              Estos datos de la empresa todavía no se han completado. Las secciones que dependen de
              ellos no se muestran al público hasta que los complete en{" "}
              <Link href="/admin/company" className="underline">
                Datos de la empresa
              </Link>
              .
            </p>
            <ul data-testid="pending" className="mt-3 list-disc pl-5">
              {pending.map((key) => (
                <li key={key}>{FIELD_LABELS[key]}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="recent-title" className="mt-10">
        <h2 id="recent-title" className="text-xl font-bold text-brand-800">
          Últimos cambios
        </h2>
        {changes.data?.length ? (
          <ul className="mt-3 space-y-1">
            {changes.data.map((r) => (
              <li key={r.id} className="text-sm">
                {itemName({
                  id: r.id,
                  changedAt: r.changed_at,
                  tableName: r.table_name,
                  rowId: r.row_id,
                  op: r.op,
                  previous: r.previous,
                  new: r.new,
                })}{" "}
                <span className="text-muted">
                  ({r.op === "insert" ? "creado" : r.op === "delete" ? "eliminado" : "modificado"})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">Todavía no hay cambios registrados.</p>
        )}
      </section>
    </>
  );
}
