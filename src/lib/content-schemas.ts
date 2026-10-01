import { z } from "zod";
import { PAGE_TEXT_BY_KEY } from "@/content/page-texts";
import { normalizeBoPhone } from "./format";
import { findUnknownTokens } from "./tokens";

// Validation for every editable entity (FR-009). Messages are in Spanish and name the field.
// The same schemas run in the Server Actions (enforcement) and can be reused by the forms.

const required = (field: string, max = 2000) =>
  z
    .string({ error: `${field}: este campo es obligatorio.` })
    .trim()
    .min(1, `${field}: este campo es obligatorio.`)
    .max(max, `${field}: no puede superar los ${max} caracteres.`);

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
// Empty strings from forms count as "not provided". Cast keeps the output type precise.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional()) as unknown as z.ZodOptional<T>;

const boPhone = (field: string) =>
  z
    .string({ error: `${field}: este campo es obligatorio.` })
    .trim()
    .min(1, `${field}: este campo es obligatorio.`)
    .transform((v, ctx) => {
      const normalized = normalizeBoPhone(v);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: `${field}: ingrese un número de Bolivia de 8 dígitos.`,
        });
        return z.NEVER;
      }
      return normalized;
    });

/** One value per line, empty lines removed. */
const lines = z
  .string()
  .default("")
  .transform((v) =>
    v
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  );

export const settingsSchema = z.object({
  companyName: required("Nombre de la empresa", 100),
  tagline: required("Frase de la empresa", 200),
  story: required("Historia", 1500),
  mission: required("Misión", 600),
  values: lines,
  certifications: lines,
  clientTypes: lines,
  phone: boPhone("Teléfono"),
  whatsappNumber: boPhone("WhatsApp"),
  email: z
    .string({ error: "Correo electrónico: este campo es obligatorio." })
    .trim()
    .min(1, "Correo electrónico: este campo es obligatorio.")
    .pipe(z.email("Correo electrónico: ingrese un correo válido.")),
  address: required("Dirección", 200),
  city: required("Ciudad", 80),
  mapUrl: optional(z.url("Mapa: ingrese una dirección web válida.")),
  businessHours: required("Horario de atención", 200),
  serviceAreas: lines,
  deliverySchedule: required("Días y horarios de entrega", 400),
  minimumOrder: required("Pedido mínimo", 300),
  orderingSteps: lines,
});

export const slugSchema = z
  .string({ error: "Dirección web: este campo es obligatorio." })
  .trim()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Dirección web: use minúsculas, números y guiones (por ejemplo: frutas-y-verduras).",
  );

const imageFields = {
  imagePath: optional(z.string()),
  imageAlt: z.string().trim().default(""),
};

const requireAltWithImage = <T extends { imagePath?: string; imageAlt: string }>(
  v: T,
  ctx: z.RefinementCtx,
) => {
  if (v.imagePath && !v.imageAlt) {
    ctx.addIssue({
      code: "custom",
      path: ["imageAlt"],
      message: "Texto alternativo de la imagen: este campo es obligatorio cuando hay imagen.",
    });
  }
};

export const categorySchema = z
  .object({
    name: required("Nombre", 80),
    slug: slugSchema,
    description: required("Descripción", 300),
    ...imageFields,
  })
  .superRefine(requireAltWithImage);

export const productSchema = z
  .object({
    categoryId: z
      .string({ error: "Categoría: este campo es obligatorio." })
      .min(1, "Categoría: este campo es obligatorio."),
    name: required("Nombre", 100),
    description: required("Descripción", 400),
    priceBob: optional(
      z.coerce
        .number({ error: "Precio: ingrese un número." })
        .positive("Precio: debe ser mayor que 0."),
    ),
    unit: optional(z.string().trim().max(40, "Unidad: no puede superar los 40 caracteres.")),
    ...imageFields,
  })
  .superRefine((v, ctx) => {
    requireAltWithImage(v, ctx);
    if (v.priceBob !== undefined && !v.unit) {
      ctx.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Unidad: indique la unidad de venta cuando hay un precio.",
      });
    }
  });

export const FAQ_TOPICS = ["ordering", "payment", "delivery", "returns", "other"] as const;

export const faqSchema = z.object({
  topic: z.enum(FAQ_TOPICS, { error: "Tema: elija un tema de la lista." }),
  question: required("Pregunta", 200),
  answer: required("Respuesta", 1000),
});

export const testimonialSchema = z.object({
  author: required("Autor", 100),
  quote: required("Testimonio", 500),
});

export const pageTextSchema = z
  .object({
    key: z.string(),
    value: z
      .string({ error: "Texto: este campo es obligatorio." })
      .trim()
      .min(1, "Texto: este campo es obligatorio."),
  })
  .superRefine((v, ctx) => {
    const def = PAGE_TEXT_BY_KEY.get(v.key);
    if (!def) {
      ctx.addIssue({ code: "custom", path: ["key"], message: "Texto: no es un texto editable." });
      return;
    }
    if (v.value.length > def.maxLength) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: `${def.label}: no puede superar los ${def.maxLength} caracteres.`,
      });
    }
    const unknown = findUnknownTokens(v.value);
    if (unknown.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: `${def.label}: variable desconocida ${unknown.join(", ")}.`,
      });
    }
  });

export const ENTITY_SCHEMAS = {
  category: categorySchema,
  product: productSchema,
  faq: faqSchema,
  testimonial: testimonialSchema,
} as const;

export type Entity = keyof typeof ENTITY_SCHEMAS;

/** Field errors keyed by field name (first message per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
