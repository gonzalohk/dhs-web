import { describe, expect, it } from "vitest";
import { formatBoPhone, formatBob, normalizeBoPhone, whatsappLink } from "@/lib/format";

describe("formatBob", () => {
  it("formats bolivianos with the Bs symbol and comma decimals", () => {
    expect(formatBob(120)).toMatch(/^Bs\s?120,00$/);
    expect(formatBob(1310.5)).toMatch(/^Bs\s?1\.310,50$/);
  });
});

describe("normalizeBoPhone", () => {
  it.each([
    ["70000000", "+59170000000"],
    ["591 70000000", "+59170000000"],
    ["+591 7000-0000", "+59170000000"],
    ["(3) 3000000", "+59133000000"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeBoPhone(input)).toBe(expected);
  });

  it.each(["7000000", "700000000", "+54 11 5555 5555", "abc"])("rejects %s", (input) => {
    expect(normalizeBoPhone(input)).toBeNull();
  });
});

describe("formatBoPhone", () => {
  it("groups the local number", () => {
    expect(formatBoPhone("+59170000000")).toBe("+591 7000 0000");
  });
});

describe("whatsappLink", () => {
  it("uses digits only and encodes the message", () => {
    expect(whatsappLink("+591 7000 0000", "Hola, ¿precio & entrega?")).toBe(
      "https://wa.me/59170000000?text=Hola%2C%20%C2%BFprecio%20%26%20entrega%3F",
    );
  });
});
