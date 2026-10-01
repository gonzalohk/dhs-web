import Link from "next/link";
import type { Entity } from "@/lib/content-schemas";
import { deleteItemAction, moveItemAction, setVisibilityAction } from "@/app/admin/content-actions";

export type ListItem = {
  id: string;
  title: string;
  subtitle?: string;
  published: boolean;
};

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
              <button className={button}>{item.published ? "Ocultar" : "Mostrar"}</button>
            </form>
            {orderable && (
              <>
                <form action={moveItemAction.bind(null, entity, item.id, "up", basePath)}>
                  <button
                    className={button}
                    disabled={index === 0}
                    aria-label={`Subir ${item.title}`}
                  >
                    Subir
                  </button>
                </form>
                <form action={moveItemAction.bind(null, entity, item.id, "down", basePath)}>
                  <button
                    className={button}
                    disabled={index === items.length - 1}
                    aria-label={`Bajar ${item.title}`}
                  >
                    Bajar
                  </button>
                </form>
              </>
            )}
            <details className="relative">
              <summary
                className={`${button} flex cursor-pointer list-none items-center text-red-800 [&::-webkit-details-marker]:hidden`}
              >
                Eliminar
              </summary>
              <form
                action={deleteItemAction.bind(null, entity, item.id, basePath)}
                className="absolute z-10 mt-2 w-60 rounded-xl border border-red-200 bg-white p-3 shadow-lg"
              >
                <p className="text-sm">
                  ¿Eliminar «{item.title}»? Podrá restaurarlo desde el historial.
                </p>
                <button className="mt-2 min-h-11 w-full rounded-full bg-red-700 px-4 text-sm font-semibold text-white">
                  Sí, eliminar
                </button>
              </form>
            </details>
          </div>
        </li>
      ))}
    </ul>
  );
}
