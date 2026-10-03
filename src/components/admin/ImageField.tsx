"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/admin/content-actions";
import { validateImage, type ImageEntity } from "@/lib/images";
import { useEditor } from "./EditorForm";
import { Field } from "./Field";
import { BusyOverlay, Spinner } from "./Spinner";

type Props = {
  entity: ImageEntity;
  /** Current stored path and its public URL (empty for no image). */
  initialPath?: string | null;
  initialSrc?: string | null;
  initialAlt?: string;
};

/** Uploads an image right away and keeps its path (and a required alt text) in the surrounding form. */
export function ImageField({ entity, initialPath, initialSrc, initialAlt = "" }: Props) {
  const [path, setPath] = useState(initialPath ?? "");
  const [src, setSrc] = useState(initialSrc ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { formId } = useEditor();

  async function upload() {
    const file = fileRef.current?.files?.[0];
    const altInput = fileRef.current?.form?.elements.namedItem(
      "imageAlt",
    ) as HTMLInputElement | null;
    const alt = altInput?.value ?? "";
    if (!file) return setMessage("Elija una imagen para subir.");
    const problem = validateImage(file);
    if (problem) return setMessage(problem);
    if (!alt.trim()) return setMessage("Escriba primero el texto alternativo de la imagen.");

    setBusy(true);
    setMessage(null);
    const data = new FormData();
    data.set("file", file);
    data.set("alt", alt);
    const result = await uploadImageAction(entity, data);
    setBusy(false);
    if (result?.ok && result.path) {
      setPath(result.path);
      setSrc(result.url ?? "");
      setMessage("Imagen subida. Recuerde guardar los cambios.");
      if (fileRef.current) fileRef.current.value = "";
    } else if (result && !result.ok) {
      setMessage(result.formError ?? result.errors?.imageAlt ?? "No se pudo subir la imagen.");
    }
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-300 p-4">
      <legend className="px-1 font-medium">Imagen</legend>
      <input type="hidden" name="imagePath" value={path} />
      <input type="hidden" name="imageSrc" value={src} />
      {src && (
        <Image
          src={src}
          alt="Imagen actual"
          width={160}
          height={100}
          className="h-24 w-40 rounded-lg object-cover"
        />
      )}
      <Field
        name="imageAlt"
        label="Texto alternativo (describe la imagen)"
        initial={initialAlt}
        hint="Se usa para accesibilidad y buscadores."
      />
      <div>
        <label htmlFor={`${formId}-file`} className="font-medium">
          Archivo (JPG, PNG, WebP o AVIF, máximo 5 MB)
        </label>
        <input
          ref={fileRef}
          id={`${formId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-1 block w-full min-h-11"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={upload}
          disabled={busy}
          className="min-h-11 rounded-full border-2 border-brand-600 px-5 font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Subiendo…
            </span>
          ) : (
            "Subir imagen"
          )}
        </button>
        {path && (
          <button
            type="button"
            onClick={() => {
              setPath("");
              setSrc("");
            }}
            className="min-h-11 rounded-full border border-gray-400 px-5"
          >
            Quitar imagen
          </button>
        )}
      </div>
      {busy && <BusyOverlay label="Subiendo imagen…" />}
      {message && (
        <p role="status" className="text-sm font-medium">
          {message}
        </p>
      )}
    </fieldset>
  );
}
