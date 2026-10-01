import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/schema";

const valid = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "",
  businessName: "Restaurante Sabor",
  message: "Quisiera una cotización semanal de verduras.",
};

const errorFields = (input: Record<string, string>) => {
  const result = inquirySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path[0]);
};

describe("inquirySchema", () => {
  it("accepts a valid inquiry and normalizes the phone to +591", () => {
    const result = inquirySchema.parse({ ...valid, email: "", phone: "7000 0000" });
    expect(result.phone).toBe("+59170000000");
    expect(result.email).toBeUndefined();
  });

  it("requires a name of 1–100 characters", () => {
    expect(errorFields({ ...valid, name: "  " })).toContain("name");
    expect(errorFields({ ...valid, name: "a".repeat(101) })).toContain("name");
  });

  it("requires email or phone", () => {
    expect(errorFields({ ...valid, email: "", phone: "" })).toEqual(["email"]);
  });

  it("validates email format", () => {
    expect(errorFields({ ...valid, email: "not-an-email" })).toContain("email");
  });

  it("validates phone: 7–20 chars of digits/+/spaces and a Bolivian number", () => {
    expect(errorFields({ ...valid, phone: "12345" })).toContain("phone");
    expect(errorFields({ ...valid, phone: "+54 11 5555 5555" })).toContain("phone");
    expect(errorFields({ ...valid, phone: "+591 7000 0000" })).toEqual([]);
  });

  it("limits business name to 120 characters", () => {
    expect(errorFields({ ...valid, businessName: "a".repeat(121) })).toContain("businessName");
  });

  it("requires a message of 10–2000 characters", () => {
    expect(errorFields({ ...valid, message: "Hola" })).toContain("message");
    expect(errorFields({ ...valid, message: "a".repeat(2001) })).toContain("message");
  });

  it("returns friendly Spanish messages", () => {
    const result = inquirySchema.safeParse({ ...valid, message: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/mensaje/);
  });
});
