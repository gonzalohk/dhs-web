import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getFaqs, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd } from "@/lib/seo";
import type { FaqTopic } from "@/lib/types";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre pedidos, formas de pago, entregas y devoluciones de nuestra distribuidora de alimentos.",
  path: "/faq",
});

const topics: { id: FaqTopic; label: string }[] = [
  { id: "ordering", label: "Pedidos" },
  { id: "payment", label: "Pagos" },
  { id: "delivery", label: "Entregas" },
  { id: "returns", label: "Devoluciones" },
  { id: "other", label: "Otras preguntas" },
];

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Preguntas frecuentes", path: "/faq" },
        ])}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />
      <PageHeader
        title="Preguntas frecuentes"
        intro="Si no encuentra su respuesta, escríbanos por WhatsApp."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        {topics.map((topic) => {
          const items = faqs.filter((f) => f.topic === topic.id);
          if (items.length === 0) return null;
          return (
            <section key={topic.id} aria-labelledby={`topic-${topic.id}`} className="mb-10">
              <h2 id={`topic-${topic.id}`} className="text-xl font-bold text-brand-800">
                {topic.label}
              </h2>
              <div className="mt-3 divide-y divide-brand-100 rounded-2xl border border-brand-100">
                {items.map((f) => (
                  <details key={f.id} className="group p-4">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <span
                        aria-hidden="true"
                        className="text-xl text-brand-600 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
        <div className="text-center">
          <WhatsAppButton
            phone={settings.whatsappNumber}
            message="Hola, tengo una consulta."
            label="Hacer otra pregunta"
          />
        </div>
      </div>
    </>
  );
}
