import { ContactForm } from "@/components/ContactForm";
import { MailIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/content";
import { formatBoPhone } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: "Contacto y cotizaciones",
    description: `Contacte a ${settings.companyName} por WhatsApp, teléfono o correo. Solicite su cotización de alimentos al por mayor en ${settings.city}.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contact" },
        ])}
      />
      <PageHeader
        title="Contacto"
        intro="La forma más rápida de hablar con nosotros es WhatsApp. También puede llamarnos o dejarnos un mensaje."
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <section aria-labelledby="whatsapp-title" className="rounded-2xl bg-brand-50 p-6">
            <h2 id="whatsapp-title" className="text-xl font-bold text-brand-800">
              Escríbanos por WhatsApp
            </h2>
            <p className="mt-1 text-muted">
              Respondemos en minutos durante el horario de atención.
            </p>
            <WhatsAppButton
              phone={settings.whatsappNumber}
              message="Hola, quisiera una cotización."
              label="Abrir WhatsApp"
              className="mt-4"
            />
          </section>

          <section aria-labelledby="details-title" className="mt-8">
            <h2 id="details-title" className="text-xl font-bold text-brand-800">
              Datos de contacto
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex min-h-11 items-center gap-2 font-medium text-brand-700 hover:underline"
                >
                  <PhoneIcon /> {formatBoPhone(settings.phone)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex min-h-11 items-center gap-2 font-medium text-brand-700 hover:underline"
                >
                  <MailIcon /> {settings.email}
                </a>
              </li>
            </ul>
            <address className="mt-3 not-italic text-muted">
              {settings.address}, {settings.city}, Bolivia
            </address>
            <p className="mt-2 text-muted">
              <span className="font-medium text-ink">Horario:</span> {settings.businessHours}
            </p>
          </section>

          {settings.mapUrl && (
            <iframe
              src={settings.mapUrl}
              title={`Mapa de ubicación de ${settings.companyName}`}
              loading="lazy"
              className="mt-6 aspect-[4/3] w-full rounded-2xl border border-brand-100"
            />
          )}
        </div>

        <section aria-labelledby="form-title">
          <h2 id="form-title" className="text-xl font-bold text-brand-800">
            Envíenos un mensaje
          </h2>
          <p className="mt-1 mb-4 text-muted">
            Para cotizaciones, apertura de cuenta o cualquier consulta.
          </p>
          <ContactForm />
        </section>
      </div>

      <section
        id="privacidad"
        aria-labelledby="privacy-title"
        className="mx-auto max-w-6xl scroll-mt-24 px-4"
      >
        <h2 id="privacy-title" className="text-lg font-bold text-brand-800">
          Aviso de privacidad
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Los datos que nos envía por el formulario (nombre, negocio, correo, teléfono y mensaje) se
          usan únicamente para responder su consulta y preparar cotizaciones. No los compartimos con
          terceros ni los usamos para publicidad. Puede pedir que los eliminemos escribiendo a{" "}
          {settings.email}.
        </p>
      </section>
    </>
  );
}
