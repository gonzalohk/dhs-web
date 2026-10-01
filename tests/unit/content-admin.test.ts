import { describe, expect, it, vi } from "vitest";
import {
  canRestore,
  saveWithLock,
  snapshotForRestore,
  swapOrder,
  type Change,
  type LockDb,
} from "@/lib/content-admin";

describe("saveWithLock", () => {
  const db = (current: string): LockDb => ({
    updateWhereUpdatedAt: vi.fn(async (_t, _id, _v, expected) =>
      expected === current ? { updatedAt: "2026-10-01T10:00:00.000002+00:00" } : null,
    ),
  });

  it("saves when updated_at matches", async () => {
    expect(await saveWithLock(db("A"), "products", "p1", { name: "x" }, "A")).toEqual({
      ok: true,
      updatedAt: "2026-10-01T10:00:00.000002+00:00",
    });
  });

  it("reports a conflict when somebody saved first, without writing", async () => {
    const d = db("B");
    expect(await saveWithLock(d, "products", "p1", { name: "x" }, "A")).toEqual({
      ok: false,
      conflict: true,
    });
  });
});

describe("swapOrder", () => {
  const items = [
    { id: "a", sortOrder: 0 },
    { id: "b", sortOrder: 1 },
    { id: "c", sortOrder: 2 },
  ];

  it("swaps with the neighbour", () => {
    expect(swapOrder(items, "b", "up")).toEqual([
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
    ]);
    expect(swapOrder(items, "b", "down")).toEqual([
      { id: "b", sortOrder: 2 },
      { id: "c", sortOrder: 1 },
    ]);
  });

  it("does nothing at the first and last positions", () => {
    expect(swapOrder(items, "a", "up")).toEqual([]);
    expect(swapOrder(items, "c", "down")).toEqual([]);
    expect(swapOrder(items, "zzz", "up")).toEqual([]);
  });

  it("separates items that share the same sort_order", () => {
    const same = [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 0 },
    ];
    const [first, second] = swapOrder(same, "b", "up");
    expect(first.sortOrder).not.toBe(second.sortOrder);
  });
});

const change = (id: string, changedAt: string, op: Change["op"], rowId = "p1"): Change => ({
  id,
  changedAt,
  tableName: "products",
  rowId,
  op,
  previous: op === "insert" ? null : { id: rowId, name: "antes" },
  new: op === "delete" ? null : { id: rowId, name: "después" },
});

describe("canRestore", () => {
  const changes = [
    change("c1", "2026-10-01T09:00:00Z", "update"),
    change("c2", "2026-10-01T10:00:00Z", "update"),
    change("c3", "2026-10-01T09:30:00Z", "update", "p2"),
  ];

  it("allows only the latest change of an item", () => {
    expect(canRestore(changes, "c2")).toBe(true);
    expect(canRestore(changes, "c1")).toBe(false);
    expect(canRestore(changes, "c3")).toBe(true);
  });

  it("does not allow restoring an insert or an unknown change", () => {
    expect(canRestore([change("c9", "2026-10-01T09:00:00Z", "insert")], "c9")).toBe(false);
    expect(canRestore(changes, "nope")).toBe(false);
  });
});

describe("snapshotForRestore", () => {
  it("returns the previous values, including the full row of a deleted item", () => {
    expect(snapshotForRestore(change("c1", "2026-10-01T09:00:00Z", "delete"))).toEqual({
      id: "p1",
      name: "antes",
    });
  });

  it("throws when there is nothing to restore", () => {
    expect(() => snapshotForRestore(change("c1", "2026-10-01T09:00:00Z", "insert"))).toThrow();
  });
});
