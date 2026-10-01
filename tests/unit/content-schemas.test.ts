import { describe, expect, it } from "vitest";
import {
  categorySchema,
  faqSchema,
  fieldErrors,
  pageTextSchema,
  productSchema,
  settingsSchema,
  testimonialSchema,
} from "@/lib/content-schemas";

const company = {
  companyName: "DHS",
  tagline: "Alimentos para su negocio",
  story: "Historia",
  mission: "Misión",
  values: "Frescura\nPuntualidad\n",
  certifications: "",
  clientTypes: "",
  phone: "57734924",
  whatsappNumber: "57734924",
  email: "distribuidoradhs2026@gmail.com",
  address: "Av. Real 123",
  city: "Santa Cruz",
  mapUrl: "",
  businessHours: "Lunes a viernes",
  serviceAreas: "Santa Cruz\nMontero",
  deliverySchedule: "Diario",
  minimumOrder: "Bs 500",
  orderingSteps: "",
};

const errorsOf = (
  schema: {
    safeParse: (
      v: unknown,
    ) => { success: boolean; error?: never } | { success: false; error: import("zod").ZodError };
  },
  input: unknown,
) => {
  const result = schema.safeParse(input);
  return result.success ? {} : fieldErrors((result as { error: import("zod").ZodError }).error);
};

describe("settingsSchema", () => {
  it("accepts DHS data, normalizing phones that start with 5 and splitting lists by line", () => {
    const parsed = settingsSchema.parse(company);
    expect(parsed.phone).toBe("+59157734924");
    expect(parsed.whatsappNumber).toBe("+59157734924");
    expect(parsed.values).toEqual(["Frescura", "Puntualidad"]);
    expect(parsed.mapUrl).toBeUndefined();
  });

  it.each(["companyName", "whatsappNumber", "email"])("requires %s", (field) => {
    expect(Object.keys(errorsOf(settingsSchema, { ...company, [field]: "  " }))).toContain(field);
  });

  it("rejects a malformed email and an invalid phone", () => {
    expect(errorsOf(settingsSchema, { ...company, email: "no-es-correo" }).email).toMatch(/Correo/);
    expect(errorsOf(settingsSchema, { ...company, phone: "123" }).phone).toMatch(/8 dígitos/);
  });
});

describe("productSchema", () => {
  const product = {
    categoryId: "c1",
    name: "Tomate",
    description: "Caja de 20 kg",
    priceBob: "",
    unit: "",
    imagePath: "",
    imageAlt: "",
  };

  it("accepts a product without price", () => {
    expect(productSchema.safeParse(product).success).toBe(true);
  });

  it("rejects zero or negative prices", () => {
    expect(errorsOf(productSchema, { ...product, priceBob: "0", unit: "kg" }).priceBob).toMatch(
      /mayor que 0/,
    );
    expect(errorsOf(productSchema, { ...product, priceBob: "-3", unit: "kg" }).priceBob).toMatch(
      /mayor que 0/,
    );
  });

  it("requires a unit whenever a price is set", () => {
    expect(errorsOf(productSchema, { ...product, priceBob: "12.5" }).unit).toMatch(/unidad/i);
    expect(productSchema.safeParse({ ...product, priceBob: "12.5", unit: "kg" }).success).toBe(
      true,
    );
  });

  it("requires alt text when there is an image", () => {
    expect(errorsOf(productSchema, { ...product, imagePath: "products/a.png" }).imageAlt).toMatch(
      /alternativo/,
    );
  });

  it("requires name", () => {
    expect(errorsOf(productSchema, { ...product, name: "" }).name).toMatch(/obligatorio/);
  });
});

describe("categorySchema", () => {
  it("accepts a valid slug and rejects spaces, capitals, or accents", () => {
    const base = { name: "Lácteos", description: "Leche y queso", slug: "lacteos" };
    expect(categorySchema.safeParse(base).success).toBe(true);
    for (const slug of ["Lácteos", "con espacio", "-guion", "doble--guion"]) {
      expect(errorsOf(categorySchema, { ...base, slug }).slug).toMatch(/minúsculas/);
    }
  });
});

describe("faqSchema and testimonialSchema", () => {
  it("accepts only the known topics", () => {
    expect(
      faqSchema.safeParse({ topic: "payment", question: "¿Factura?", answer: "Sí." }).success,
    ).toBe(true);
    expect(errorsOf(faqSchema, { topic: "otro", question: "¿?", answer: "x" }).topic).toMatch(
      /tema/i,
    );
  });

  it("requires author and quote", () => {
    expect(Object.keys(errorsOf(testimonialSchema, { author: "", quote: "" }))).toEqual([
      "author",
      "quote",
    ]);
  });
});

describe("pageTextSchema", () => {
  it("accepts text with known tokens", () => {
    expect(
      pageTextSchema.safeParse({ key: "home.title", value: "{companyName}: alimentos" }).success,
    ).toBe(true);
  });

  it("rejects unknown keys, empty text, over-long text, and unknown tokens", () => {
    expect(errorsOf(pageTextSchema, { key: "nope", value: "x" }).key).toBeDefined();
    expect(errorsOf(pageTextSchema, { key: "home.title", value: "  " }).value).toMatch(
      /obligatorio/,
    );
    expect(errorsOf(pageTextSchema, { key: "home.eyebrow", value: "a".repeat(81) }).value).toMatch(
      /80 caracteres/,
    );
    expect(errorsOf(pageTextSchema, { key: "home.title", value: "Hola {foo}" }).value).toMatch(
      /\{foo\}/,
    );
  });
});
