import Link from "next/link";
import type { Entity } from "@/lib/content-schemas";
import { deleteItemAction, moveItemAction, setVisibilityAction } from "@/app/admin/content-actions";
import { SubmitButton } from "./SubmitButton";

export type ListItem = {
  id: string;
  title: string;
  subtitle?: string;
  published: boolean;
  /** Categories only: how many products belong to it (deleting it also deletes them). */
  productCount?: number;
};

const hasProducts = (item: ListItem) => (item.productCount ?? 0) > 0;

const button = "min-h-11 rounded-full border border-gray-400 px-4 text-sm hover:bg-brand-50";

/** List with show/hide, reorder, edit and delete controls (all usable without JavaScript). */
export function ItemList({
  items,
  entity,
  basePath,
  orderable = true,
}: {
  items: ListItem[];
  entity: Entity;
  basePath: string;
  orderable?: boolean;
}) {
  if (items.length === 0) return <p className="text-muted">Todavía no hay elementos.</p>;
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} data-testid="item" className="rounded-2xl border border-brand-100 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{item.title}</p>
              {item.subtitle && <p className="text-sm text-muted">{item.subtitle}</p>}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${item.published ? "bg-brand-50 text-brand-800" : "bg-gray-200 text-gray-800"}`}
            >
              {item.published ? "Visible" : "Oculto"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`${basePath}?edit=${item.id}#formulario`}
              className={`${button} inline-flex items-center`}
            >
              Editar
            </Link>
            <form
              action={setVisibilityAction.bind(null, entity, item.id, !item.published, basePath)}
            >
              <SubmitButton className={button} pendingLabel="Guardando…">
                {item.published ? "Ocultar" : "Mostrar"}
              </SubmitButton>
            </form>
            {orderable && (
              <>
                <form action={moveItemAction.bind(null, entity, item.id, "up", basePath)}>
                  <SubmitButton
                    className={button}
                    pendingLabel="…"
                    disabled={index === 0}
                    aria-label={`Subir ${item.title}`}
                  >
                    Subir
                  </SubmitButton>
                </form>
                <form action={moveItemAction.bind(null, entity, item.id, "down", basePath)}>
                  <SubmitButton
                    className={button}
                    pendingLabel="…"
                    disabled={index === items.length - 1}
                    aria-label={`Bajar ${item.title}`}
                  >
                    Bajar
                  </SubmitButton>
                </form>
              </>
            )}
            <details className="relative">
              <summary
                className={`${button} flex cursor-pointer list-none items-center text-red-800 [&::-webkit-details-marker]:hidden`}
              >
                Eliminar
              </summary>
              {hasProducts(item) ? (
                <div
                  role="alert"
                  className="absolute z-10 mt-2 w-72 rounded-xl border border-red-200 bg-white p-3 shadow-lg"
                >
                  <p className="text-sm font-semibold text-red-800">No se puede eliminar</p>
                  <p className="mt-1 text-sm">
                    «{item.title}» aún tiene {item.productCount} producto
                    {item.productCount === 1 ? "" : "s"} asociado
                    {item.productCount === 1 ? "" : "s"}. Elimine esos productos o muévalos a otra
                    categoría y vuelva a intentarlo.
                  </p>
                  <Link
                    href="/admin/products"
                    className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-brand-600 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Ir a productos
                  </Link>
                </div>
              ) : (
                <form
                  action={deleteItemAction.bind(null, entity, item.id, basePath)}
                  className="absolute z-10 mt-2 w-64 rounded-xl border border-red-200 bg-white p-3 shadow-lg"
                >
                  <p className="text-sm">
                    ¿Eliminar «{item.title}»? Podrá restaurarlo desde el historial.
                  </p>
                  <SubmitButton
                    className="mt-2 min-h-11 w-full rounded-full bg-red-700 px-4 text-sm font-semibold text-white"
                    pendingLabel="Eliminando…"
                  >
                    Sí, eliminar
                  </SubmitButton>
                </form>
              )}
            </details>
          </div>
        </li>
      ))}
    </ul>
  );
}
