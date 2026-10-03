import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Applies the real migrations to an in-memory PostgreSQL (PGlite) with stand-ins for the Supabase
// roles, auth.uid() and storage tables, then checks permissions, triggers, and the change log.
// This covers the database rules without needing a Supabase project.

const MIGRATIONS = [
  "0001_schema",
  "0002_rls",
  "0003_seed",
  "0004_editable_content",
  "0005_editor_policies",
  "0006_company_data_dhs",
];
const STAFF = "11111111-1111-1111-1111-111111111111";

let db: PGlite;

async function as(
  role: "anon" | "authenticated",
  sub: string | null,
  sql: string,
  params: unknown[] = [],
) {
  await db.exec(
    `set role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false);`,
  );
  try {
    return await db.query<Record<string, any>>(sql, params); // eslint-disable-line @typescript-eslint/no-explicit-any
  } finally {
    await db.exec("reset role");
  }
}

async function fails(
  role: "anon" | "authenticated",
  sub: string | null,
  sql: string,
  params: unknown[] = [],
) {
  try {
    const r = await as(role, sub, sql, params);
    return (r.affectedRows ?? 0) === 0;
  } catch {
    return true;
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema public, storage to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  `);
  for (const name of MIGRATIONS) {
    await db.exec(
      readFileSync(path.join(__dirname, "../../supabase/migrations", `${name}.sql`), "utf8"),
    );
  }
});

afterAll(() => db.close());

describe("DHS company data (migration 0006)", () => {
  it("sets the DHS contact data and marks what is missing", async () => {
    const { rows } = await db.query<Record<string, string>>("select * from settings");
    expect(rows[0]).toMatchObject({
      company_name: "DHS",
      phone: "+59157734924",
      whatsapp_number: "+59157734924",
      email: "distribuidoradhs2026@gmail.com",
    });
    expect(rows[0].address).toContain("[Pendiente]");
  });

  it("keeps invented demo testimonials, FAQs, and prices off the public site", async () => {
    const q = async (sql: string) => (await db.query<{ n: number }>(sql)).rows[0].n;
    expect(await q("select count(*)::int n from testimonials where published")).toBe(0);
    expect(await q("select count(*)::int n from faqs where published")).toBe(0);
    expect(await q("select count(*)::int n from products where price_bob is not null")).toBe(0);
  });

  it("renames the image columns to image_path", async () => {
    const { rows } = await db.query<{ n: number }>(
      "select count(*)::int n from information_schema.columns where table_name in ('products','categories') and column_name = 'image_path'",
    );
    expect(rows[0].n).toBe(2);
  });
});

describe("permissions", () => {
  it("lets visitors read published content only, and nothing else", async () => {
    expect(
      (await as("anon", null, "select count(*)::int n from products")).rows[0].n,
    ).toBeGreaterThan(0);
    expect(await fails("anon", null, "update settings set company_name = 'X'")).toBe(true);
    expect(await fails("anon", null, "insert into page_texts (key, value) values ('x', 'y')")).toBe(
      true,
    );
    expect(await fails("anon", null, "delete from products")).toBe(true);
    await expect(as("anon", null, "select 1 from content_changes")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("creates the public image bucket", async () => {
    const { rows } = await db.query("select id, public from storage.buckets");
    expect(rows[0]).toMatchObject({ id: "site-images", public: true });
  });
});

describe("staff editing, change log, and optimistic locking", () => {
  let productId: string;
  let loaded: string;

  it("saves when updated_at matches and writes nothing when it is stale", async () => {
    const first = await as(
      "authenticated",
      STAFF,
      "select id, updated_at::text u from products order by sort_order limit 1",
    );
    productId = first.rows[0].id;
    loaded = first.rows[0].u;
    const ok = await as(
      "authenticated",
      STAFF,
      "update products set name = 'Nuevo nombre', price_bob = 12.5, unit = 'kg' where id = $1 and updated_at = $2::timestamptz returning id",
      [productId, loaded],
    );
    expect(ok.rows).toHaveLength(1);
    const stale = await as(
      "authenticated",
      STAFF,
      "update products set name = 'Pisado' where id = $1 and updated_at = $2::timestamptz returning id",
      [productId, loaded],
    );
    expect(stale.rows).toHaveLength(0);
  });

  it("logs the change with the previous value and the staff id", async () => {
    const { rows } = await db.query(
      "select op, changed_by::text, previous->>'name' as before, new->>'name' as after from content_changes where table_name = 'products' and row_id = $1 order by changed_at desc",
      [productId],
    );
    expect(rows[0]).toMatchObject({
      op: "update",
      changed_by: STAFF,
      before: "Tomate",
      after: "Nuevo nombre",
    });
  });

  it("rejects a price without a unit", async () => {
    expect(
      await fails(
        "authenticated",
        STAFF,
        "update products set price_bob = 5, unit = null where id = $1",
        [productId],
      ),
    ).toBe(true);
  });

  it("does not log or bump the version for a save that changes nothing", async () => {
    await as("authenticated", STAFF, "update settings set tagline = 'Nueva' where id = 1");
    const count = async () =>
      (await db.query<{ n: number }>("select count(*)::int n from content_changes")).rows[0].n;
    const before = await count();
    await as("authenticated", STAFF, "update settings set tagline = 'Nueva' where id = 1");
    expect(await count()).toBe(before);
  });

  it("logs deletes with the full row so the item can be restored", async () => {
    await as("authenticated", STAFF, "delete from products where id = $1", [productId]);
    const { rows } = await as(
      "authenticated",
      STAFF,
      "select op, previous from content_changes where table_name = 'products' and row_id = $1 order by changed_at desc limit 1",
      [productId],
    );
    expect(rows[0].op).toBe("delete");
    const snapshot = { ...rows[0].previous };
    delete snapshot.updated_at; // the database sets it again
    const columns = Object.keys(snapshot);
    await as(
      "authenticated",
      STAFF,
      `insert into products (${columns.join(",")}) select ${columns.join(",")} from jsonb_populate_record(null::products, $1::jsonb)`,
      [JSON.stringify(snapshot)],
    );
    const restored = await db.query("select name from products where id = $1", [productId]);
    expect(restored.rows[0]).toMatchObject({ name: "Nuevo nombre" });
  });

  it("lets staff see unpublished rows that visitors cannot, but not write the log", async () => {
    await db.exec("update products set published = false");
    expect(
      (await as("authenticated", STAFF, "select count(*)::int n from products where not published"))
        .rows[0].n,
    ).toBeGreaterThan(0);
    expect((await as("anon", null, "select count(*)::int n from products")).rows[0].n).toBe(0);
    expect(
      await fails(
        "authenticated",
        STAFF,
        "insert into content_changes (table_name, row_id, op) values ('x', 'y', 'update')",
      ),
    ).toBe(true);
  });

  it("logs page texts by key", async () => {
    await as(
      "authenticated",
      STAFF,
      "insert into page_texts (key, value) values ('home.title', '{companyName}: hola')",
    );
    const { rows } = await db.query<{ row_id: string }>(
      "select row_id from content_changes where table_name = 'page_texts'",
    );
    expect(rows[0]?.row_id).toBe("home.title");
  });
});

describe("categories and products (staff)", () => {
  it("lets staff create a category, associate a product with it, and move the product to another category", async () => {
    const a = await as(
      "authenticated",
      STAFF,
      "insert into categories (slug, name, description) values ('cat-a', 'A', 'a') returning id",
    );
    const b = await as(
      "authenticated",
      STAFF,
      "insert into categories (slug, name, description) values ('cat-b', 'B', 'b') returning id",
    );
    const product = await as(
      "authenticated",
      STAFF,
      "insert into products (category_id, name, description) values ($1, 'P', 'p') returning id, category_id",
      [a.rows[0].id],
    );
    expect(product.rows[0].category_id).toBe(a.rows[0].id);
    const moved = await as(
      "authenticated",
      STAFF,
      "update products set category_id = $1 where id = $2 returning category_id",
      [b.rows[0].id, product.rows[0].id],
    );
    expect(moved.rows[0].category_id).toBe(b.rows[0].id);
  });

  it("reports a duplicate slug as a unique violation (code 23505)", async () => {
    await as(
      "authenticated",
      STAFF,
      "insert into categories (slug, name, description) values ('dup', 'D', 'd')",
    );
    await expect(
      as(
        "authenticated",
        STAFF,
        "insert into categories (slug, name, description) values ('dup', 'D2', 'd2')",
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("deletes a category together with its products and logs every deletion", async () => {
    const c = await as(
      "authenticated",
      STAFF,
      "insert into categories (slug, name, description) values ('to-delete', 'X', 'x') returning id",
    );
    const p = await as(
      "authenticated",
      STAFF,
      "insert into products (category_id, name, description) values ($1, 'PX', 'px') returning id",
      [c.rows[0].id],
    );
    await as("authenticated", STAFF, "delete from categories where id = $1", [c.rows[0].id]);
    expect(
      (await db.query("select 1 from products where id = $1", [p.rows[0].id])).rows,
    ).toHaveLength(0);
    const logged = await db.query<{ table_name: string }>(
      "select table_name from content_changes where op = 'delete' and row_id in ($1, $2)",
      [c.rows[0].id, p.rows[0].id],
    );
    expect(logged.rows.map((r) => r.table_name).sort()).toEqual(["categories", "products"]);
  });
});
