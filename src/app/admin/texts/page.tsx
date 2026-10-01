import { EditorForm } from "@/components/admin/EditorForm";
import { Field } from "@/components/admin/Field";
import { PreviewPanel } from "@/components/admin/Preview";
import { PAGE_TEXT_PAGES, PAGE_TEXTS } from "@/content/page-texts";
import { getRawSettings } from "@/lib/content";
import { requireStaff } from "@/lib/staff-session";
import { COMPANY_TOKENS } from "@/lib/tokens";
import { saveTextAction } from "../content-actions";

export default async function TextsPage() {
  const { supabase } = await requireStaff();
  const [settings, rows] = await Promise.all([
    getRawSettings(),
    supabase.from("page_texts").select("key, value, updated_at"),
  ]);
  if (rows.error) throw rows.error;
  const saved = new Map(rows.data.map((r) => [r.key as string, r]));

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Textos de las páginas</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Edite los textos principales de cada página. Puede usar variables de los datos de la
        empresa: {COMPANY_TOKENS.join(" ")}. Si una variable aún no tiene valor, ese texto no se
        muestra.
      </p>
      {PAGE_TEXT_PAGES.map((page) => {
        const texts = PAGE_TEXTS.filter((t) => t.page === page.id);
        if (texts.length === 0) return null;
        return (
          <section key={page.id} aria-labelledby={`page-${page.id}`} className="mt-10">
            <h2 id={`page-${page.id}`} className="text-xl font-bold text-brand-800">
              {page.label}
            </h2>
            <div className="mt-4 space-y-6">
              {texts.map((def) => {
                const row = saved.get(def.key);
                const value = row?.value ?? def.default;
                return (
                  <div key={def.key} className="max-w-2xl rounded-2xl border border-brand-100 p-4">
                    <EditorForm
                      action={saveTextAction}
                      initialValues={{ key: def.key, value }}
                      updatedAt={row?.updated_at ?? ""}
                      submitLabel="Guardar texto"
                    >
                      <input type="hidden" name="key" value={def.key} />
                      <Field
                        name="value"
                        label={def.label}
                        initial={value}
                        textarea={def.maxLength > 100}
                        rows={3}
                        maxLength={def.maxLength}
                        required
                      />
                      <PreviewPanel kind="text" settings={settings} />
                    </EditorForm>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
