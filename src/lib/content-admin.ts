// Framework-free editing rules (optimistic locking, ordering, restore), so they can be unit tested
// without Supabase. The Server Actions wire them to the database.

export type LockDb = {
  /** Updates the row only when its updated_at equals `expectedUpdatedAt`; returns the new updated_at or null. */
  updateWhereUpdatedAt: (
    table: string,
    id: string | number,
    values: Record<string, unknown>,
    expectedUpdatedAt: string,
  ) => Promise<{ updatedAt: string } | null>;
};

export type SaveResult = { ok: true; updatedAt: string } | { ok: false; conflict: true };

/**
 * Saves only if nobody changed the row since it was loaded (FR-013). `loadedUpdatedAt` must be the exact
 * string the database returned; it is never parsed, because timestamps keep microsecond precision.
 */
export async function saveWithLock(
  db: LockDb,
  table: string,
  id: string | number,
  values: Record<string, unknown>,
  loadedUpdatedAt: string,
): Promise<SaveResult> {
  const result = await db.updateWhereUpdatedAt(table, id, values, loadedUpdatedAt);
  return result ? { ok: true, updatedAt: result.updatedAt } : { ok: false, conflict: true };
}

export type Ordered = { id: string; sortOrder: number };

/** The two `sort_order` updates that move an item one position, or [] at the first or last position. */
export function swapOrder(
  items: Ordered[],
  id: string,
  direction: "up" | "down",
): { id: string; sortOrder: number }[] {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sorted.findIndex((item) => item.id === id);
  const neighbourIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || neighbourIndex < 0 || neighbourIndex >= sorted.length) return [];
  const a = sorted[index];
  const b = sorted[neighbourIndex];
  // Equal sort_order values are separated so the swap always changes the order.
  const aOrder = a.sortOrder === b.sortOrder ? neighbourIndex : b.sortOrder;
  const bOrder = a.sortOrder === b.sortOrder ? index : a.sortOrder;
  return [
    { id: a.id, sortOrder: aOrder },
    { id: b.id, sortOrder: bOrder },
  ];
}

export type Change = {
  id: string;
  changedAt: string;
  tableName: string;
  rowId: string;
  op: "insert" | "update" | "delete";
  previous: Record<string, unknown> | null;
  new: Record<string, unknown> | null;
};

/** A change can be restored only when it is the latest change of its item. */
export function canRestore(changes: Change[], changeId: string): boolean {
  const change = changes.find((c) => c.id === changeId);
  if (!change || change.op === "insert") return false;
  const latest = changes
    .filter((c) => c.tableName === change.tableName && c.rowId === change.rowId)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))[0];
  return latest.id === change.id;
}

/** The row to write back: for an update the previous values, for a delete the full row to re-insert. */
export function snapshotForRestore(change: Change): Record<string, unknown> {
  if (!change.previous) throw new Error("This change has no previous value to restore");
  return change.previous;
}

/** A readable name for the changed item, taken from its stored values. */
export function itemName(change: Change): string {
  const row = change.new ?? change.previous ?? {};
  const name = row.name ?? row.question ?? row.author ?? row.company_name ?? row.key;
  return typeof name === "string" && name ? name : change.rowId;
}
