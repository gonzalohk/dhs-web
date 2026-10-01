import { EditorForm } from "@/components/admin/EditorForm";
import { Field } from "@/components/admin/Field";
import { PreviewPanel } from "@/components/admin/Preview";
import { getRawSettings } from "@/lib/content";
import { requireStaff } from "@/lib/staff-session";
import { COMPANY_TOKENS } from "@/lib/tokens";
import { saveCompanyAction } from "../content-actions";

export default async function CompanyPage() {
  await requireStaff();
  const s = await getRawSettings();
  const initial: Record<string, string> = {
    companyName: s.companyName,
    tagline: s.tagline,
    story: s.story,
    mission: s.mission,
    values: s.values.join("\n"),
    certifications: s.certifications.join("\n"),
    clientTypes: s.clientTypes.join("\n"),
    phone: s.phone,
    whatsappNumber: s.whatsappNumber,
    email: s.email,
    address: s.address,
    city: s.city,
    mapUrl: s.mapUrl ?? "",
    businessHours: s.businessHours,
    serviceAreas: s.serviceAreas.join("\n"),
    deliverySchedule: s.deliverySchedule,
    minimumOrder: s.minimumOrder,
    orderingSteps: s.orderingSteps.join("\n"),
  };
  const f = (name: string) => initial[name];

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Datos de la empresa</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Estos datos se escriben una sola vez y se usan en todo el sitio: encabezado, pie de página,
        contacto, enlaces de WhatsApp, títulos y datos para buscadores. Los campos que dicen
        «[Pendiente]» no se muestran al público hasta que los complete. En los textos de la página
        puede usar estas variables: {COMPANY_TOKENS.join(" ")}.
      </p>
      <div className="mt-8 max-w-2xl">
        <EditorForm
          action={saveCompanyAction}
          initialValues={initial}
          updatedAt={s.updatedAt ?? ""}
        >
          <Field
            name="companyName"
            label="Nombre de la empresa"
            initial={f("companyName")}
            required
            maxLength={100}
          />
          <Field
            name="tagline"
            label="Frase que resume a la empresa"
            initial={f("tagline")}
            required
            maxLength={200}
          />
          <Field
            name="phone"
            label="Teléfono"
            type="tel"
            initial={f("phone")}
            required
            hint="8 dígitos; se guarda con +591."
          />
          <Field
            name="whatsappNumber"
            label="WhatsApp"
            type="tel"
            initial={f("whatsappNumber")}
            required
            hint="8 dígitos; se guarda con +591."
          />
          <Field
            name="email"
            label="Correo electrónico"
            type="email"
            initial={f("email")}
            required
          />
          <Field name="address" label="Dirección" initial={f("address")} required maxLength={200} />
          <Field name="city" label="Ciudad" initial={f("city")} required maxLength={80} />
          <Field
            name="mapUrl"
            label="Mapa (dirección web para incrustar, opcional)"
            type="url"
            initial={f("mapUrl")}
          />
          <Field
            name="businessHours"
            label="Horario de atención"
            initial={f("businessHours")}
            required
            maxLength={200}
          />
          <Field
            name="story"
            label="Historia de la empresa"
            textarea
            initial={f("story")}
            required
            maxLength={1500}
          />
          <Field
            name="mission"
            label="Misión"
            textarea
            rows={3}
            initial={f("mission")}
            required
            maxLength={600}
          />
          <Field
            name="values"
            label="Valores"
            textarea
            rows={4}
            initial={f("values")}
            hint="Uno por línea."
          />
          <Field
            name="certifications"
            label="Certificaciones"
            textarea
            rows={3}
            initial={f("certifications")}
            hint="Una por línea. Deje vacío si no tiene."
          />
          <Field
            name="clientTypes"
            label="Tipos de clientes que atiende"
            textarea
            rows={3}
            initial={f("clientTypes")}
            hint="Uno por línea."
          />
          <Field
            name="serviceAreas"
            label="Zonas de entrega"
            textarea
            rows={3}
            initial={f("serviceAreas")}
            hint="Una por línea."
          />
          <Field
            name="deliverySchedule"
            label="Días y horarios de entrega"
            textarea
            rows={3}
            initial={f("deliverySchedule")}
            required
            maxLength={400}
          />
          <Field
            name="minimumOrder"
            label="Pedido mínimo"
            textarea
            rows={2}
            initial={f("minimumOrder")}
            required
            maxLength={300}
          />
          <Field
            name="orderingSteps"
            label="Pasos para ser cliente"
            textarea
            rows={4}
            initial={f("orderingSteps")}
            hint="Uno por línea."
          />
          <PreviewPanel kind="company" />
        </EditorForm>
      </div>
    </>
  );
}
