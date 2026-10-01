// Business logic of the staff editors (validation, locking, ordering, restore), independent of Next.js
// and Supabase so it can be unit tested. src/app/admin/content-actions.ts wires it to the real services.
// Rules: specs/002-editable-content-company-data/contracts/staff-editor.md
import {
  canRestore,
  saveWithLock,
  snapshotForRestore,
  swapOrder,
  type Change,
  type LockDb,
} from "./content-admin";
import {
  ENTITY_SCHEMAS,
  fieldErrors,
  pageTextSchema,
  settingsSchema,
  type Entity,
} from "./content-schemas";
import { buildImagePath, storagePublicUrl, validateImage, type ImageEntity } from "./images";

export type ContentDb = LockDb & {
  insert: (table: string, values: Record<string, unknown>) => Promise<{ id: string }>;
  updateRow: (table: string, pk: string | number, values: Record<string, unknown>) => Promise<void>;
  deleteRow: (table: string, pk: string | number) => Promise<void>;
  /** Row exists? Returns its updated_at (exact string) when it does. */
  find: (table: string, pk: string | number) => Promise<{ updatedAt: string } | null>;
  listOrder: (table: string) => Promise<{ id: string; sortOrder: number }[]>;
  countWhere: (table: string, column: string, value: string) => Promise<number>;
  changesForItem: (table: string, rowId: string) => Promise<Change[]>;
  getChange: (id: string) => Promise<Change | null>;
};

export type Deps = {
  /** Signed-in staff user id, or null. */
  getUserId: () => Promise<string | null>;
  db: ContentDb;
  /** Makes saved changes visible on the public pages right away. */
  revalidateSite: () => void;
  uploadFile: (path: string, bytes: ArrayBuffer, contentType: string) => Promise<void>;
};

export type ActionState =
  | null
  | {
      ok: true;
      message?: string;
      updatedAt?: string;
      path?: string;
      url?: string | null;
      /** Submitted values of an edit, so the form keeps showing them after saving. */
      values?: Record<string, string>;
    }
  | {
      ok: false;
      unauthorized?: boolean;
      conflict?: boolean;
      errors?: Record<string, string>;
      formError?: string;
      values?: Record<string, string>;
    };

type Raw = Record<string, string>;

const TABLES: Record<Entity, string> = {
  category: "categories",
  product: "products",
  faq: "faqs",
  testimonial: "testimonials",
};

const ORDERED: Entity[] = ["category", "product", "faq"];

const UNAUTHORIZED: ActionState = { ok: false, unauthorized: true };
const conflict = (raw: Raw): ActionState => ({
  ok: false,
  conflict: true,
  formError:
    "Otra persona guardó cambios en este elemento. Recargue la página para ver la versión actual; lo que escribió se conserva aquí.",
  values: raw,
});

async function authorized(deps: Deps): Promise<string | null> {
  return deps.getUserId();
}

function toRow(entity: Entity, v: Record<string, unknown>): Record<string, unknown> {
  switch (entity) {
    case "category":
      return {
        name: v.name,
        slug: v.slug,
        description: v.description,
        image_path: v.imagePath ?? null,
        image_alt: v.imageAlt ?? "",
      };
    case "product":
      return {
        category_id: v.categoryId,
        name: v.name,
        description: v.description,
        price_bob: v.priceBob ?? null,
        unit: v.priceBob === undefined ? null : v.unit,
        image_path: v.imagePath ?? null,
        image_alt: v.imageAlt ?? "",
      };
    case "faq":
      return { topic: v.topic, question: v.question, answer: v.answer };
    case "testimonial":
      return { author: v.author, quote: v.quote };
  }
}

export async function saveCompany(deps: Deps, raw: Raw): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };
  const v = parsed.data;
  const result = await saveWithLock(
    deps.db,
    "settings",
    1,
    {
      company_name: v.companyName,
      tagline: v.tagline,
      story: v.story,
      mission: v.mission,
      values: v.values,
      certifications: v.certifications,
      client_types: v.clientTypes,
      phone: v.phone,
      whatsapp_number: v.whatsappNumber,
      email: v.email,
      address: v.address,
      city: v.city,
      map_url: v.mapUrl ?? null,
      business_hours: v.businessHours,
      service_areas: v.serviceAreas,
      delivery_schedule: v.deliverySchedule,
      minimum_order: v.minimumOrder,
      ordering_steps: v.orderingSteps,
    },
    raw.updatedAt ?? "",
  );
  if (!result.ok) return conflict(raw);
  deps.revalidateSite();
  return {
    ok: true,
    message: "Datos de la empresa guardados.",
    updatedAt: result.updatedAt,
    values: raw,
  };
}

export async function saveText(deps: Deps, raw: Raw): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  const parsed = pageTextSchema.safeParse({ key: raw.key, value: raw.value });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };
  const { key, value } = parsed.data;
  const existing = await deps.db.find("page_texts", key);
  const loaded = raw.updatedAt ?? "";

  if (!existing) {
    if (loaded) return conflict(raw);
    await deps.db.insert("page_texts", { key, value });
    deps.revalidateSite();
    return { ok: true, message: "Texto guardado." };
  }
  // The row exists: it must be the version the form loaded.
  const result = loaded
    ? await saveWithLock(deps.db, "page_texts", key, { value }, loaded)
    : ({ ok: false, conflict: true } as const);
  if (!result.ok) return conflict(raw);
  deps.revalidateSite();
  return { ok: true, message: "Texto guardado.", updatedAt: result.updatedAt, values: raw };
}

export async function saveItem(deps: Deps, entity: Entity, raw: Raw): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  const parsed = ENTITY_SCHEMAS[entity].safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };
  const table = TABLES[entity];
  const row = toRow(entity, parsed.data as Record<string, unknown>);

  if (!raw.id) {
    if (ORDERED.includes(entity)) {
      const order = await deps.db.listOrder(table);
      row.sort_order = order.length ? Math.max(...order.map((o) => o.sortOrder)) + 1 : 0;
    }
    await deps.db.insert(table, row);
    deps.revalidateSite();
    return { ok: true, message: "Elemento agregado." };
  }

  const result = await saveWithLock(deps.db, table, raw.id, row, raw.updatedAt ?? "");
  if (!result.ok) return conflict(raw);
  deps.revalidateSite();
  return { ok: true, message: "Cambios guardados.", updatedAt: result.updatedAt, values: raw };
}

export async function setVisibility(
  deps: Deps,
  entity: Entity,
  id: string,
  published: boolean,
): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  await deps.db.updateRow(TABLES[entity], id, { published });
  deps.revalidateSite();
  return { ok: true };
}

export async function moveItem(
  deps: Deps,
  entity: Entity,
  id: string,
  direction: "up" | "down",
): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  if (!ORDERED.includes(entity))
    return { ok: false, formError: "Este elemento no se puede ordenar." };
  const table = TABLES[entity];
  const updates = swapOrder(await deps.db.listOrder(table), id, direction);
  for (const u of updates) await deps.db.updateRow(table, u.id, { sort_order: u.sortOrder });
  if (updates.length > 0) deps.revalidateSite();
  return { ok: true };
}

export async function deleteItem(deps: Deps, entity: Entity, id: string): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  if (entity === "category" && (await deps.db.countWhere("products", "category_id", id)) > 0) {
    return {
      ok: false,
      formError:
        "No se puede eliminar una categoría que tiene productos. Elimine o mueva los productos primero.",
    };
  }
  await deps.db.deleteRow(TABLES[entity], id);
  deps.revalidateSite();
  return { ok: true };
}

export async function uploadImage(
  deps: Deps,
  entity: ImageEntity,
  file: { type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
  alt: string,
): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  const problem = validateImage(file);
  if (problem) return { ok: false, formError: problem };
  if (!alt.trim()) {
    return {
      ok: false,
      errors: { imageAlt: "Texto alternativo de la imagen: este campo es obligatorio." },
    };
  }
  const path = buildImagePath(entity, file.type, crypto.randomUUID());
  try {
    await deps.uploadFile(path, await file.arrayBuffer(), file.type);
  } catch (error) {
    console.error("Image upload failed", error);
    return {
      ok: false,
      formError: "No se pudo subir la imagen. La imagen actual no cambió; inténtelo de nuevo.",
    };
  }
  return { ok: true, path, url: storagePublicUrl(path) };
}

export async function restoreChange(deps: Deps, changeId: string): Promise<ActionState> {
  if (!(await authorized(deps))) return UNAUTHORIZED;
  const change = await deps.db.getChange(changeId);
  if (!change) return { ok: false, formError: "No se encontró el cambio." };
  const history = await deps.db.changesForItem(change.tableName, change.rowId);
  if (!canRestore(history, changeId)) {
    return {
      ok: false,
      formError: "Este elemento tiene cambios más recientes; solo se puede restaurar el último.",
    };
  }
  // updated_at is set by the database; the rest of the previous row is written back.
  const { updated_at: _ignored, ...values } = snapshotForRestore(change);
  void _ignored;
  const pk = change.tableName === "settings" ? 1 : change.rowId;
  if (change.op === "delete") {
    await deps.db.insert(change.tableName, values);
  } else {
    await deps.db.updateRow(change.tableName, pk, values);
  }
  deps.revalidateSite();
  return { ok: true, message: "Valor anterior restaurado." };
}
