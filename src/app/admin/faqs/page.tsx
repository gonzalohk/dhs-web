import { EditorForm } from "@/components/admin/EditorForm";
import { ErrorNotice } from "@/components/admin/ErrorNotice";
import { Field } from "@/components/admin/Field";
import { ItemList } from "@/components/admin/ItemList";
import { PreviewPanel } from "@/components/admin/Preview";
import { FAQ_TOPICS } from "@/lib/content-schemas";
import { mapFaq } from "@/lib/mappers";
import { requireStaff } from "@/lib/staff-session";
import { saveItemAction } from "../content-actions";

const TOPIC_LABELS: Record<(typeof FAQ_TOPICS)[number], string> = {
  ordering: "Pedidos",
  payment: "Pagos",
  delivery: "Entregas",
  returns: "Devoluciones",
  other: "Otras preguntas",
};

export default async function FaqsAdminPage({ searchParams }: PageProps<"/admin/faqs">) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
  if (error) throw error;
  const faqs = data.map(mapFaq);
  const editing = faqs.find((f) => f.id === params.edit);

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Preguntas frecuentes</h1>
      <ErrorNotice message={typeof params.error === "string" ? params.error : undefined} />
      <div className="mt-6">
        <ItemList
          entity="faq"
          basePath="/admin/faqs"
          items={faqs.map((f) => ({
            id: f.id,
            title: f.question,
            subtitle: TOPIC_LABELS[f.topic],
            published: f.published ?? true,
          }))}
        />
      </div>

      <section
        id="formulario"
        aria-labelledby="form-title"
        className="mt-10 max-w-2xl scroll-mt-24"
      >
        <h2 id="form-title" className="text-xl font-bold text-brand-800">
          {editing ? "Editar pregunta" : "Agregar pregunta"}
        </h2>
        <div className="mt-4">
          <EditorForm
            key={editing?.id ?? "new"}
            action={saveItemAction.bind(null, "faq")}
            id={editing?.id}
            updatedAt={editing?.updatedAt}
            initialValues={{
              topic: editing?.topic ?? "ordering",
              question: editing?.question ?? "",
              answer: editing?.answer ?? "",
            }}
            submitLabel={editing ? "Guardar cambios" : "Agregar pregunta"}
          >
            <div>
              <label htmlFor="topic" className="font-medium">
                Tema
              </label>
              <select
                id="topic"
                name="topic"
                defaultValue={editing?.topic ?? "ordering"}
                className="mt-1 block w-full rounded-lg border border-gray-400 px-3 py-2.5 text-base"
              >
                {FAQ_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {TOPIC_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <Field
              name="question"
              label="Pregunta"
              initial={editing?.question}
              required
              maxLength={200}
            />
            <Field
              name="answer"
              label="Respuesta"
              textarea
              rows={4}
              initial={editing?.answer}
              required
              maxLength={1000}
            />
            <PreviewPanel kind="faq" />
          </EditorForm>
        </div>
      </section>
    </>
  );
}
