import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getPageTexts, getSettings, pageText } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: "Entregas y pedidos",
    description: `Zonas de entrega, horarios, pedido mínimo y cómo convertirse en cliente de ${settings.companyName}, distribuidora de alimentos en Bolivia.`,
    path: "/delivery",
  });
}

export default async function DeliveryPage() {
  const [settings, texts] = await Promise.all([getSettings(), getPageTexts()]);
  const hasAreas = settings.serviceAreas.length > 0;
  const hasSteps = settings.orderingSteps.length > 0;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Entregas y pedidos", path: "/delivery" },
        ])}
      />
      <PageHeader title="Entregas y pedidos" intro={pageText(texts, "delivery.intro", settings)} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        {hasAreas && (
          <section
            aria-labelledby="areas-title"
            className="rounded-2xl border border-brand-100 p-6"
          >
            <h2 id="areas-title" className="text-xl font-bold text-brand-800">
              Zonas de entrega
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {settings.serviceAreas.map((a) => (
                <li key={a} className="rounded-full bg-brand-50 px-3 py-1 text-brand-800">
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}
        {settings.deliverySchedule && (
          <section
            aria-labelledby="schedule-title"
            className="rounded-2xl border border-brand-100 p-6"
          >
            <h2 id="schedule-title" className="text-xl font-bold text-brand-800">
              Días y horarios de entrega
            </h2>
            <p className="mt-3 text-muted">{settings.deliverySchedule}</p>
          </section>
        )}
        {settings.minimumOrder && (
          <section
            aria-labelledby="minimum-title"
            className="rounded-2xl border border-brand-100 p-6"
          >
            <h2 id="minimum-title" className="text-xl font-bold text-brand-800">
              Pedido mínimo
            </h2>
            <p className="mt-3 text-muted">{settings.minimumOrder}</p>
          </section>
        )}
        {hasSteps && (
          <section
            aria-labelledby="steps-title"
            className="rounded-2xl border border-brand-100 p-6"
          >
            <h2 id="steps-title" className="text-xl font-bold text-brand-800">
              Cómo ser cliente
            </h2>
            <ol className="mt-3 space-y-3">
              {settings.orderingSteps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-center">
        <WhatsAppButton
          phone={settings.whatsappNumber}
          message="Hola, quisiera abrir una cuenta de cliente."
          label="Abrir cuenta por WhatsApp"
        />
        <WhatsAppButton
          phone={settings.whatsappNumber}
          message="Hola, quisiera una cotización."
          label="Solicitar cotización"
          variant="outline"
        />
      </div>
    </>
  );
}
