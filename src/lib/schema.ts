import { z } from "zod";
import { normalizeBoPhone } from "./format";

// Contact form validation. See specs/001-food-distribution-website/contracts/contact-form.md.

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const inquirySchema = z
  .object({
    name: z
      .string({ error: "Ingrese su nombre." })
      .trim()
      .min(1, "Ingrese su nombre.")
      .max(100, "El nombre no puede superar los 100 caracteres."),
    email: z.preprocess(
      emptyToUndefined,
      z.email("Ingrese un correo electrónico válido.").max(254).optional(),
    ),
    phone: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .regex(/^[\d+\s\-().]{7,20}$/, "Ingrese un teléfono válido, por ejemplo 70000000.")
        .transform((v, ctx) => {
          const normalized = normalizeBoPhone(v);
          if (!normalized) {
            ctx.addIssue({ code: "custom", message: "Ingrese un número de Bolivia de 8 dígitos." });
            return z.NEVER;
          }
          return normalized;
        })
        .optional(),
    ),
    businessName: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(120, "El nombre del negocio no puede superar los 120 caracteres.")
        .optional(),
    ),
    message: z
      .string({ error: "Escriba su mensaje." })
      .trim()
      .min(10, "El mensaje debe tener al menos 10 caracteres.")
      .max(2000, "El mensaje no puede superar los 2000 caracteres."),
  })
  .refine((v) => v.email || v.phone, {
    message: "Ingrese un correo electrónico o un teléfono para poder responderle.",
    path: ["email"],
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
export type InquiryField = "name" | "email" | "phone" | "businessName" | "message";
