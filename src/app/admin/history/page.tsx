import type { Change } from "@/lib/content-admin";
import { canRestore, itemName } from "@/lib/content-admin";
import { requireStaff } from "@/lib/staff-session";
import { restoreChangeAction } from "../content-actions";

const TABLE_LABELS: Record<string, string> = {
  settings: "Datos de la empresa",
  page_texts: "Texto de página",
  categories: "Categoría",
  products: "Producto",
  faqs: "Pregunta frecuente",
  testimonials: "Testimonio",
};

const OP_LABELS = { insert: "Creado", update: "Modificado", delete: "Eliminado" } as const;

const dateFormat = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/La_Paz",
});

export default async function HistoryPage({ searchParams }: PageProps<"/admin/history">) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const { data, error } = await supabase
    .from("content_changes")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const changes: (Change & { changedBy: string | null })[] = data.map((r) => ({
    id: r.id,
    changedAt: r.changed_at,
    tableName: r.table_name,
    rowId: r.row_id,
    op: r.op,
    previous: r.previous,
    new: r.new,
    changedBy: r.changed_by,
  }));

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Historial de cambios</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Puede restaurar el valor anterior del último cambio de cada elemento.
      </p>
      {params.restored && (
        <p role="status" className="mt-4 rounded-lg bg-brand-50 p-3 font-medium text-brand-800">
          Valor anterior restaurado.
        </p>
      )}
      {typeof params.error === "string" && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 font-medium text-red-800">
          {params.error}
        </p>
      )}
      {changes.length === 0 && (
        <p className="mt-6 text-muted">Todavía no hay cambios registrados.</p>
      )}
      <ul className="mt-6 space-y-3">
        {changes.map((c) => (
          <li key={c.id} data-testid="change" className="rounded-2xl border border-brand-100 p-4">
            <p className="font-semibold">
              {OP_LABELS[c.op]}: {TABLE_LABELS[c.tableName] ?? c.tableName} · {itemName(c)}
            </p>
            <p className="text-sm text-muted">
              {dateFormat.format(new Date(c.changedAt))} ·{" "}
              {c.changedBy ? `Personal (${c.changedBy.slice(0, 8)})` : "Panel de la base de datos"}
            </p>
            {canRestore(changes, c.id) && (
              <form action={restoreChangeAction.bind(null, c.id)} className="mt-3">
                <button className="min-h-11 rounded-full border-2 border-brand-600 px-5 font-semibold text-brand-700 hover:bg-brand-50">
                  Restaurar valor anterior
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
