import { EditorForm } from "@/components/admin/EditorForm";
import { ErrorNotice } from "@/components/admin/ErrorNotice";
import { Field } from "@/components/admin/Field";
import { ItemList } from "@/components/admin/ItemList";
import { PreviewPanel } from "@/components/admin/Preview";
import { mapTestimonial } from "@/lib/mappers";
import { requireStaff } from "@/lib/staff-session";
import { saveItemAction } from "../content-actions";

export default async function TestimonialsAdminPage({
  searchParams,
}: PageProps<"/admin/testimonials">) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const { data, error } = await supabase.from("testimonials").select("*").order("updated_at");
  if (error) throw error;
  const testimonials = data.map(mapTestimonial);
  const editing = testimonials.find((t) => t.id === params.edit);

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Testimonios</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Publique solo testimonios reales de clientes que hayan dado su permiso.
      </p>
      <ErrorNotice message={typeof params.error === "string" ? params.error : undefined} />
      <div className="mt-6">
        <ItemList
          entity="testimonial"
          basePath="/admin/testimonials"
          orderable={false}
          items={testimonials.map((t) => ({
            id: t.id,
            title: t.author,
            subtitle: t.quote,
            published: t.published ?? true,
          }))}
        />
      </div>

      <section
        id="formulario"
        aria-labelledby="form-title"
        className="mt-10 max-w-2xl scroll-mt-24"
      >
        <h2 id="form-title" className="text-xl font-bold text-brand-800">
          {editing ? "Editar testimonio" : "Agregar testimonio"}
        </h2>
        <div className="mt-4">
          <EditorForm
            key={editing?.id ?? "new"}
            action={saveItemAction.bind(null, "testimonial")}
            id={editing?.id}
            updatedAt={editing?.updatedAt}
            initialValues={{ author: editing?.author ?? "", quote: editing?.quote ?? "" }}
            submitLabel={editing ? "Guardar cambios" : "Agregar testimonio"}
          >
            <Field
              name="author"
              label="Autor (cliente o tipo de negocio)"
              initial={editing?.author}
              required
              maxLength={100}
            />
            <Field
              name="quote"
              label="Testimonio"
              textarea
              rows={3}
              initial={editing?.quote}
              required
              maxLength={500}
            />
            <PreviewPanel kind="testimonial" />
          </EditorForm>
        </div>
      </section>
    </>
  );
}
