import { EditorForm } from "@/components/admin/EditorForm";
import { ErrorNotice } from "@/components/admin/ErrorNotice";
import { Field } from "@/components/admin/Field";
import { ImageField } from "@/components/admin/ImageField";
import { ItemList } from "@/components/admin/ItemList";
import { PreviewPanel } from "@/components/admin/Preview";
import { getRawSettings } from "@/lib/content";
import { formatBob } from "@/lib/format";
import { mapCategory, mapProduct } from "@/lib/mappers";
import { requireStaff } from "@/lib/staff-session";
import { saveItemAction } from "../content-actions";

export default async function ProductsAdminPage({ searchParams }: PageProps<"/admin/products">) {
  const { supabase } = await requireStaff();
  const params = await searchParams;
  const [cats, prods, settings] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").order("sort_order"),
    getRawSettings(),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  const categories = cats.data.map(mapCategory);
  const products = prods.data.map(mapProduct);
  const editing = products.find((p) => p.id === params.edit);
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Sin categoría";

  return (
    <>
      <h1 className="text-2xl font-bold text-brand-800">Productos</h1>
      <ErrorNotice message={typeof params.error === "string" ? params.error : undefined} />
      <div className="mt-6">
        <ItemList
          entity="product"
          basePath="/admin/products"
          items={products.map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: `${categoryName(p.categoryId)} · ${p.priceBob !== null ? `${formatBob(p.priceBob)} / ${p.unit}` : "Solicitar cotización"}`,
            published: p.published ?? true,
          }))}
        />
      </div>

      <section
        id="formulario"
        aria-labelledby="form-title"
        className="mt-10 max-w-2xl scroll-mt-24"
      >
        <h2 id="form-title" className="text-xl font-bold text-brand-800">
          {editing ? `Editar producto: ${editing.name}` : "Agregar producto"}
        </h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-muted">Primero cree una categoría.</p>
        ) : (
          <div className="mt-4">
            <EditorForm
              key={editing?.id ?? "new"}
              action={saveItemAction.bind(null, "product")}
              id={editing?.id}
              updatedAt={editing?.updatedAt}
              initialValues={{
                categoryId: editing?.categoryId ?? categories[0].id,
                name: editing?.name ?? "",
                description: editing?.description ?? "",
                priceBob: editing?.priceBob?.toString() ?? "",
                unit: editing?.unit ?? "",
                imagePath: editing?.imagePath ?? "",
                imageSrc: editing?.imageSrc ?? "",
                imageAlt: editing?.imageAlt ?? "",
              }}
              submitLabel={editing ? "Guardar cambios" : "Agregar producto"}
            >
              <CategorySelect categories={categories} selected={editing?.categoryId} />
              <Field name="name" label="Nombre" initial={editing?.name} required maxLength={100} />
              <Field
                name="description"
                label="Descripción"
                textarea
                rows={3}
                initial={editing?.description}
                required
                maxLength={400}
              />
              <Field
                name="priceBob"
                label="Precio en Bs (opcional)"
                type="number"
                step="0.01"
                initial={editing?.priceBob?.toString()}
                hint="Déjelo vacío para mostrar «Solicitar cotización»."
              />
              <Field
                name="unit"
                label="Unidad de venta"
                initial={editing?.unit ?? ""}
                hint="Obligatoria si hay precio. Ejemplo: kg, caja, maple."
                maxLength={40}
              />
              <ImageField
                entity="products"
                initialPath={editing?.imagePath}
                initialSrc={editing?.imageSrc}
                initialAlt={editing?.imageAlt}
              />
              <PreviewPanel kind="product" whatsappNumber={settings.whatsappNumber} />
            </EditorForm>
          </div>
        )}
      </section>
    </>
  );
}

function CategorySelect({
  categories,
  selected,
}: {
  categories: { id: string; name: string }[];
  selected?: string;
}) {
  return (
    <div>
      <label htmlFor="categoryId" className="font-medium">
        Categoría{" "}
        <span className="text-red-700" aria-hidden="true">
          *
        </span>
      </label>
      <select
        id="categoryId"
        name="categoryId"
        defaultValue={selected ?? categories[0]?.id}
        className="mt-1 block w-full rounded-lg border border-gray-400 px-3 py-2.5 text-base"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
