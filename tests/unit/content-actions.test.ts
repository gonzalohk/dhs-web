import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Change } from "@/lib/content-admin";
import {
  deleteItem,
  moveItem,
  restoreChange,
  saveCompany,
  saveItem,
  saveText,
  setVisibility,
  uploadImage,
  type ContentDb,
  type Deps,
} from "@/lib/content-service";

type Row = Record<string, unknown> & { updated_at?: string };

/** In-memory database: tables of rows keyed by pk, with a version counter used as updated_at. */
function fakeDb(initial: Record<string, Record<string, Row>> = {}) {
  const tables: Record<string, Record<string, Row>> = structuredClone(initial);
  const changes: Change[] = [];
  let version = 1;
  let nextId = 1;
  const t = (name: string) => (tables[name] ??= {});
  const log = (
    table: string,
    rowId: string,
    op: Change["op"],
    previous: Row | null,
    next: Row | null,
  ) =>
    changes.push({
      id: `ch${changes.length + 1}`,
      changedAt: `2026-10-01T10:00:${String(changes.length).padStart(2, "0")}Z`,
      tableName: table,
      rowId,
      op,
      previous,
      new: next,
    });
  const db: ContentDb = {
    updateWhereUpdatedAt: vi.fn(async (table, id, values, expected) => {
      const row = t(table)[String(id)];
      if (!row || row.updated_at !== expected) return null;
      const before = { ...row };
      Object.assign(row, values, { updated_at: `v${++version}` });
      log(table, String(id), "update", before, { ...row });
      return { updatedAt: row.updated_at! };
    }),
    insert: vi.fn(async (table, values) => {
      const id = String(values.id ?? values.key ?? `id${nextId++}`);
      t(table)[id] = { id, ...values, updated_at: `v${++version}` };
      log(table, id, "insert", null, { ...t(table)[id] });
      return { id };
    }),
    updateRow: vi.fn(async (table, pk, values) => {
      const row = t(table)[String(pk)];
      const before = { ...row };
      Object.assign(row, values, { updated_at: `v${++version}` });
      log(table, String(pk), "update", before, { ...row });
    }),
    deleteRow: vi.fn(async (table, pk) => {
      const before = { ...t(table)[String(pk)] };
      delete t(table)[String(pk)];
      log(table, String(pk), "delete", before, null);
    }),
    find: vi.fn(async (table, pk) => {
      const row = t(table)[String(pk)];
      return row ? { updatedAt: row.updated_at! } : null;
    }),
    listOrder: vi.fn(async (table) =>
      Object.values(t(table)).map((r) => ({
        id: String(r.id),
        sortOrder: Number(r.sort_order ?? 0),
      })),
    ),
    countWhere: vi.fn(
      async (table, column, value) =>
        Object.values(t(table)).filter((r) => r[column] === value).length,
    ),
    changesForItem: vi.fn(async (table, rowId) =>
      changes.filter((c) => c.tableName === table && c.rowId === rowId),
    ),
    getChange: vi.fn(async (id) => changes.find((c) => c.id === id) ?? null),
  };
  return { db, tables, changes };
}

function setup(signedIn = true, initial: Record<string, Record<string, Row>> = {}) {
  const fake = fakeDb(initial);
  const deps: Deps = {
    getUserId: async () => (signedIn ? "staff-1" : null),
    db: fake.db,
    revalidateSite: vi.fn(),
    uploadFile: vi.fn(async () => {}),
  };
  return { deps, ...fake };
}

const company = {
  companyName: "DHS",
  tagline: "Alimentos",
  story: "Historia",
  mission: "Misión",
  values: "Frescura",
  certifications: "",
  clientTypes: "",
  phone: "57734924",
  whatsappNumber: "57734924",
  email: "distribuidoradhs2026@gmail.com",
  address: "Av. Real 123",
  city: "Santa Cruz",
  mapUrl: "",
  businessHours: "Lunes a viernes",
  serviceAreas: "",
  deliverySchedule: "Diario",
  minimumOrder: "Bs 500",
  orderingSteps: "",
  updatedAt: "v1",
};

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

describe("authorization (SC-007)", () => {
  it("every action refuses without a session and writes nothing", async () => {
    const { deps, db, tables } = setup(false, {
      products: { p1: { id: "p1", category_id: "c1", updated_at: "v1" } },
    });
    const results = await Promise.all([
      saveCompany(deps, company),
      saveText(deps, { key: "home.title", value: "x" }),
      saveItem(deps, "product", { categoryId: "c1", name: "x", description: "y" }),
      setVisibility(deps, "product", "p1", false),
      moveItem(deps, "product", "p1", "up"),
      deleteItem(deps, "product", "p1"),
      uploadImage(
        deps,
        "products",
        { type: "image/png", size: 10, arrayBuffer: async () => new ArrayBuffer(1) },
        "alt",
      ),
      restoreChange(deps, "ch1"),
    ]);
    for (const result of results) expect(result).toEqual({ ok: false, unauthorized: true });
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.updateRow).not.toHaveBeenCalled();
    expect(db.deleteRow).not.toHaveBeenCalled();
    expect(db.updateWhereUpdatedAt).not.toHaveBeenCalled();
    expect(deps.uploadFile).not.toHaveBeenCalled();
    expect(deps.revalidateSite).not.toHaveBeenCalled();
    expect(tables.products.p1.updated_at).toBe("v1");
  });
});

describe("saveCompany", () => {
  it("saves valid DHS data (phone starting with 5), revalidates, and returns the new version", async () => {
    const { deps, tables } = setup(true, {
      settings: { "1": { id: 1, company_name: "Vieja", updated_at: "v1" } },
    });
    const result = await saveCompany(deps, company);
    expect(result).toMatchObject({ ok: true });
    expect(tables.settings["1"]).toMatchObject({
      company_name: "DHS",
      phone: "+59157734924",
      whatsapp_number: "+59157734924",
      email: "distribuidoradhs2026@gmail.com",
    });
    expect(deps.revalidateSite).toHaveBeenCalledOnce();
  });

  it("writes nothing and names the field when a value is invalid", async () => {
    const { deps, db } = setup(true, { settings: { "1": { id: 1, updated_at: "v1" } } });
    const result = await saveCompany(deps, { ...company, email: "no-es-correo", companyName: "" });
    expect(result).toMatchObject({
      ok: false,
      errors: { email: expect.any(String), companyName: expect.any(String) },
    });
    expect(db.updateWhereUpdatedAt).not.toHaveBeenCalled();
    expect(deps.revalidateSite).not.toHaveBeenCalled();
  });

  it("warns instead of overwriting when somebody saved first, keeping the typed values", async () => {
    const { deps, tables } = setup(true, {
      settings: { "1": { id: 1, company_name: "Otro", updated_at: "v9" } },
    });
    const result = await saveCompany(deps, company);
    expect(result).toMatchObject({ ok: false, conflict: true, values: { companyName: "DHS" } });
    expect(tables.settings["1"].company_name).toBe("Otro");
  });
});

describe("saveText", () => {
  it("creates the text when it does not exist yet, and updates it with the lock afterwards", async () => {
    const { deps, tables } = setup();
    expect(
      await saveText(deps, { key: "home.title", value: "{companyName} para su negocio" }),
    ).toMatchObject({ ok: true });
    const version = tables.page_texts["home.title"].updated_at!;
    expect(
      await saveText(deps, { key: "home.title", value: "Nuevo", updatedAt: version }),
    ).toMatchObject({ ok: true });
    expect(tables.page_texts["home.title"].value).toBe("Nuevo");
    expect(
      await saveText(deps, { key: "home.title", value: "Viejo", updatedAt: version }),
    ).toMatchObject({ conflict: true });
  });

  it("rejects unknown variables", async () => {
    const { deps, db } = setup();
    const result = await saveText(deps, { key: "home.title", value: "Hola {foo}" });
    expect(result).toMatchObject({
      ok: false,
      errors: { value: expect.stringContaining("{foo}") },
    });
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe("saveItem", () => {
  const product = { categoryId: "c1", name: "Tomate", description: "Caja de 20 kg" };

  it("adds a product at the end of the order and publishes it", async () => {
    const { deps, tables } = setup(true, {
      products: { a: { id: "a", sort_order: 4, updated_at: "v1" } },
    });
    expect(
      await saveItem(deps, "product", { ...product, priceBob: "12.5", unit: "kg" }),
    ).toMatchObject({ ok: true });
    const created = Object.values(tables.products).find((r) => r.name === "Tomate")!;
    expect(created).toMatchObject({ price_bob: 12.5, unit: "kg", sort_order: 5 });
    expect(deps.revalidateSite).toHaveBeenCalled();
  });

  it("rejects a price without unit and writes nothing", async () => {
    const { deps, db } = setup();
    const result = await saveItem(deps, "product", { ...product, priceBob: "12.5" });
    expect(result).toMatchObject({ ok: false, errors: { unit: expect.any(String) } });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("updates an existing item with the lock", async () => {
    const { deps, tables } = setup(true, {
      faqs: { f1: { id: "f1", question: "viejo", updated_at: "v1" } },
    });
    const ok = await saveItem(deps, "faq", {
      id: "f1",
      updatedAt: "v1",
      topic: "payment",
      question: "¿Factura?",
      answer: "Sí.",
    });
    expect(ok).toMatchObject({ ok: true });
    expect(tables.faqs.f1.question).toBe("¿Factura?");
    const stale = await saveItem(deps, "faq", {
      id: "f1",
      updatedAt: "v1",
      topic: "payment",
      question: "x",
      answer: "y",
    });
    expect(stale).toMatchObject({ ok: false, conflict: true });
  });
});

describe("visibility, order, and deletion", () => {
  it("hides an item, moves it with its neighbour, and deletes it", async () => {
    const { deps, tables } = setup(true, {
      faqs: {
        a: { id: "a", sort_order: 0, published: true, updated_at: "v1" },
        b: { id: "b", sort_order: 1, published: true, updated_at: "v1" },
      },
    });
    await setVisibility(deps, "faq", "a", false);
    expect(tables.faqs.a.published).toBe(false);
    await moveItem(deps, "faq", "b", "up");
    expect(tables.faqs.b.sort_order).toBe(0);
    expect(tables.faqs.a.sort_order).toBe(1);
    await deleteItem(deps, "faq", "a");
    expect(tables.faqs.a).toBeUndefined();
    expect(deps.revalidateSite).toHaveBeenCalledTimes(3);
  });

  it("refuses to delete a category that still has products", async () => {
    const { deps, tables } = setup(true, {
      categories: { c1: { id: "c1", updated_at: "v1" } },
      products: { p1: { id: "p1", category_id: "c1", updated_at: "v1" } },
    });
    expect(await deleteItem(deps, "category", "c1")).toMatchObject({
      ok: false,
      formError: expect.stringContaining("aún tiene 1 producto"),
    });
    expect(tables.categories.c1).toBeDefined();
  });
});

describe("uploadImage", () => {
  const file = (type: string, size: number) => ({
    type,
    size,
    arrayBuffer: async () => new ArrayBuffer(size),
  });

  it("uploads a valid image and returns its path", async () => {
    const { deps } = setup();
    const result = await uploadImage(deps, "products", file("image/png", 1000), "Tomates rojos");
    expect(result).toMatchObject({ ok: true, path: expect.stringMatching(/^products\/.+\.png$/) });
    expect(deps.uploadFile).toHaveBeenCalledOnce();
  });

  it("rejects 6 MB files and PDFs with a clear message, uploading nothing", async () => {
    const { deps } = setup();
    expect(
      await uploadImage(deps, "products", file("image/png", 6 * 1024 * 1024), "x"),
    ).toMatchObject({ formError: expect.stringContaining("grande") });
    expect(await uploadImage(deps, "products", file("application/pdf", 10), "x")).toMatchObject({
      formError: expect.stringContaining("JPG"),
    });
    expect(deps.uploadFile).not.toHaveBeenCalled();
  });

  it("requires alt text and reports upload failures without changing anything", async () => {
    const { deps } = setup();
    expect(await uploadImage(deps, "products", file("image/png", 10), " ")).toMatchObject({
      errors: { imageAlt: expect.any(String) },
    });
    deps.uploadFile = vi.fn(async () => Promise.reject(new Error("storage down")));
    expect(await uploadImage(deps, "products", file("image/png", 10), "alt")).toMatchObject({
      ok: false,
      formError: expect.stringContaining("imagen actual"),
    });
  });
});

describe("restoreChange (FR-012)", () => {
  it("restores the previous value of an update and records the restore as a new change", async () => {
    const { deps, tables, changes } = setup(true, {
      products: { p1: { id: "p1", name: "Tomate", price_bob: 10, updated_at: "v1" } },
    });
    await saveItem(deps, "product", {
      id: "p1",
      updatedAt: "v1",
      categoryId: "c1",
      name: "Tomate",
      description: "d",
      priceBob: "999",
      unit: "kg",
    });
    expect(tables.products.p1.price_bob).toBe(999);
    const wrong = changes.at(-1)!;
    expect(await restoreChange(deps, wrong.id)).toMatchObject({ ok: true });
    expect(tables.products.p1.price_bob).toBe(10);
    expect(changes.at(-1)!.id).not.toBe(wrong.id);
  });

  it("fails when a newer change exists for that item", async () => {
    const { deps, changes } = setup(true, {
      faqs: { f1: { id: "f1", question: "a", updated_at: "v1" } },
    });
    await setVisibility(deps, "faq", "f1", false);
    await setVisibility(deps, "faq", "f1", true);
    expect(await restoreChange(deps, changes[0].id)).toMatchObject({
      ok: false,
      formError: expect.stringContaining("más recientes"),
    });
  });

  it("re-inserts a deleted row from its full snapshot", async () => {
    const { deps, tables, changes } = setup(true, {
      testimonials: { t1: { id: "t1", author: "Ana", quote: "Muy bien", updated_at: "v1" } },
    });
    await deleteItem(deps, "testimonial", "t1");
    expect(tables.testimonials.t1).toBeUndefined();
    expect(await restoreChange(deps, changes.at(-1)!.id)).toMatchObject({ ok: true });
    expect(tables.testimonials.t1).toMatchObject({ author: "Ana", quote: "Muy bien" });
  });
});
