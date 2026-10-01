// Supabase implementation of ContentDb. Uses the signed-in staff client, so Row Level Security is the
// final guard; the content_changes log is written by database triggers.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Change } from "./content-admin";
import type { ContentDb } from "./content-service";

const pkColumn = (table: string) => (table === "page_texts" ? "key" : "id");

type ChangeRow = {
  id: string;
  changed_at: string;
  table_name: string;
  row_id: string;
  op: Change["op"];
  previous: Record<string, unknown> | null;
  new: Record<string, unknown> | null;
};

const toChange = (r: ChangeRow): Change => ({
  id: r.id,
  changedAt: r.changed_at,
  tableName: r.table_name,
  rowId: r.row_id,
  op: r.op,
  previous: r.previous,
  new: r.new,
});

export function supabaseContentDb(db: SupabaseClient): ContentDb {
  return {
    async updateWhereUpdatedAt(table, id, values, expectedUpdatedAt) {
      const { data, error } = await db
        .from(table)
        .update(values)
        .eq(pkColumn(table), id)
        .eq("updated_at", expectedUpdatedAt)
        .select("updated_at");
      if (error) throw error;
      return data.length > 0 ? { updatedAt: data[0].updated_at } : null;
    },
    async insert(table, values) {
      const pk = pkColumn(table);
      const { data, error } = await db.from(table).insert(values).select(pk).single();
      if (error) throw error;
      return { id: String((data as unknown as Record<string, unknown>)[pk]) };
    },
    async updateRow(table, pk, values) {
      const { error } = await db.from(table).update(values).eq(pkColumn(table), pk);
      if (error) throw error;
    },
    async deleteRow(table, pk) {
      const { error } = await db.from(table).delete().eq(pkColumn(table), pk);
      if (error) throw error;
    },
    async find(table, pk) {
      const { data, error } = await db
        .from(table)
        .select("updated_at")
        .eq(pkColumn(table), pk)
        .maybeSingle();
      if (error) throw error;
      return data ? { updatedAt: data.updated_at } : null;
    },
    async listOrder(table) {
      const { data, error } = await db.from(table).select("id, sort_order");
      if (error) throw error;
      return data.map((r) => ({ id: String(r.id), sortOrder: Number(r.sort_order) }));
    },
    async countWhere(table, column, value) {
      const { count, error } = await db
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq(column, value);
      if (error) throw error;
      return count ?? 0;
    },
    async changesForItem(table, rowId) {
      const { data, error } = await db
        .from("content_changes")
        .select("*")
        .eq("table_name", table)
        .eq("row_id", rowId)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return (data as ChangeRow[]).map(toChange);
    },
    async getChange(id) {
      const { data, error } = await db
        .from("content_changes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toChange(data as ChangeRow) : null;
    },
  };
}
