// Demo content layered over the placeholder content ONLY for automated tests (E2E_DEMO=1), so end-to-end
// tests can check prices, FAQs, testimonials, and trust blocks without a database. Never used otherwise.
import type { Faq, Product, Settings, Testimonial } from "@/lib/types";

export const demoSettings: Partial<Settings> = {
  tagline: "Alimentos para su negocio.",
  story: "Historia de prueba.",
  mission: "Misión de prueba.",
  values: ["Frescura", "Puntualidad"],
  certifications: ["Certificación de prueba"],
  clientTypes: ["Restaurantes", "Tiendas"],
  address: "Av. Prueba 123",
  city: "Santa Cruz",
  mapUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=-63.22%2C-17.82%2C-63.14%2C-17.76&layer=mapnik",
  businessHours: "Lunes a viernes",
  serviceAreas: ["Santa Cruz", "Montero"],
  deliverySchedule: "Entregas de lunes a sábado.",
  minimumOrder: "Pedido mínimo de Bs 500.",
  orderingSteps: ["Escríbanos.", "Reciba su cotización.", "Coordine la entrega."],
};

export const demoPrices: Record<string, { priceBob: number; unit: string }> = {
  p1: { priceBob: 120, unit: "caja 20 kg" },
  p5: { priceBob: 48, unit: "kg" },
};

export const demoFaqs: Faq[] = [
  {
    id: "f1",
    topic: "ordering",
    question: "¿Cómo hago mi primer pedido?",
    answer: "Escríbanos por WhatsApp.",
  },
  {
    id: "f3",
    topic: "payment",
    question: "¿Qué formas de pago aceptan?",
    answer: "Pago de prueba: transferencia.",
  },
  { id: "f5", topic: "delivery", question: "¿A qué zonas entregan?", answer: "Zonas de prueba." },
  {
    id: "f7",
    topic: "returns",
    question: "¿Qué pasa si hay un problema?",
    answer: "Aviso dentro de 24 horas.",
  },
];

export const demoTestimonials: Testimonial[] = [
  { id: "t1", author: "Restaurante de prueba", quote: "Testimonio de prueba uno." },
  { id: "t2", author: "Tienda de prueba", quote: "Testimonio de prueba dos." },
  { id: "t3", author: "Catering de prueba", quote: "Testimonio de prueba tres." },
];

export function applyDemoProducts(products: Product[]): Product[] {
  return products.map((p) => ({ ...p, ...(demoPrices[p.id] ?? {}) }));
}
