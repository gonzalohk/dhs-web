import { EditorForm } from "@/components/admin/EditorForm";
import { ErrorNotice } from "@/components/admin/ErrorNotice";
import { Field } from "@/components/admin/Field";
import { ImageField } from "@/components/admin/ImageField";
import { ItemList } from "@/components/admin/ItemList";
import { PreviewPanel } from "@/components/admin/Preview";
import { mapCategory } from "@/lib/mappers";
import { requireStaff } from "@/lib/staff-session";
import { saveItemAction } from "../content-actions";

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  const categories = data.map(mapCategory);
  const editing = categories.find((c) => c.id === params.edit);

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Categorías</h1>
      <ErrorNotice message={typeof params.error === "string" ? params.error : undefined} />
      <div className="mt-6">
        <ItemList
          entity="category"
          basePath="/admin/categories"
          items={categories.map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: c.description,
            published: c.published ?? true,
          }))}
        />
      </div>

      <section
        id="formulario"
        aria-labelledby="form-title"
        className="mt-10 max-w-2xl scroll-mt-24"
      >
        <h2 id="form-title" className="text-xl font-bold text-brand-800">
          {editing ? `Editar categoría: ${editing.name}` : "Agregar categoría"}
        </h2>
        <div className="mt-4">
          <EditorForm
            key={editing?.id ?? "new"}
            action={saveItemAction.bind(null, "category")}
            id={editing?.id}
            updatedAt={editing?.updatedAt}
            initialValues={{
              name: editing?.name ?? "",
              slug: editing?.slug ?? "",
              description: editing?.description ?? "",
              imagePath: editing?.imagePath ?? "",
              imageSrc: editing?.imageSrc ?? "",
              imageAlt: editing?.imageAlt ?? "",
            }}
            submitLabel={editing ? "Guardar cambios" : "Agregar categoría"}
          >
            <Field name="name" label="Nombre" initial={editing?.name} required maxLength={80} />
            <Field
              name="slug"
              label="Dirección web"
              initial={editing?.slug}
              required
              hint="Minúsculas, números y guiones. Ejemplo: frutas-y-verduras. Cambiarla cambia el enlace de la categoría."
            />
            <Field
              name="description"
              label="Descripción"
              textarea
              rows={3}
              initial={editing?.description}
              required
              maxLength={300}
            />
            <ImageField
              entity="categories"
              initialPath={editing?.imagePath}
              initialSrc={editing?.imageSrc}
              initialAlt={editing?.imageAlt}
            />
            <PreviewPanel kind="category" />
          </EditorForm>
        </div>
      </section>
    </>
  );
}
