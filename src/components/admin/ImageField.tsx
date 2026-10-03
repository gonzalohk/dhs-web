"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImageAction } from "@/app/admin/content-actions";
import { validateImage, IMAGE_TYPES, type ImageEntity } from "@/lib/images";
import { MAX_ORIGINAL_BYTES, formatBytes, optimizeImage } from "@/lib/image-optimize";
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
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const { formId } = useEditor();

  /** Uploads the chosen file right away (choosing a file is the click that starts the upload). */
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!(file.type in IMAGE_TYPES)) {
      input.value = "";
      return setMessage({
        text: "El archivo debe ser una imagen JPG, PNG, WebP o AVIF.",
        error: true,
      });
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      input.value = "";
      return setMessage({
        text: "La imagen es demasiado grande. El máximo es 25 MB.",
        error: true,
      });
    }

    setBusy(true);
    setMessage(null);
    try {
      // Reduce the image in the browser first: smaller upload, less storage, faster pages.
      const { file: optimized, originalBytes, optimizedBytes } = await optimizeImage(file);
      const problem = validateImage(optimized);
      if (problem) return setMessage({ text: problem, error: true });

      const data = new FormData();
      data.set("file", optimized);
      const result = await uploadImageAction(entity, data);
      if (result?.ok && result.path) {
        setPath(result.path);
        setSrc(result.url ?? "");
        const saved =
          optimizedBytes < originalBytes
            ? `Imagen optimizada (${formatBytes(originalBytes)} → ${formatBytes(optimizedBytes)}) y subida.`
            : "Imagen subida.";
        setMessage({ text: `${saved} Escriba su descripción y guarde los cambios.`, error: false });
      } else if (result && !result.ok) {
        setMessage({ text: result.formError ?? "No se pudo subir la imagen.", error: true });
      }
    } catch (error) {
      console.error("Image upload failed", error);
      setMessage({
        text: "No se pudo subir la imagen. Revise su conexión e inténtelo de nuevo (máximo 5 MB).",
        error: true,
      });
    } finally {
      input.value = "";
      setBusy(false);
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
          unoptimized
          className="h-24 w-40 rounded-lg object-cover"
        />
      )}
      <Field
        name="imageAlt"
        label="Texto alternativo (describe la imagen)"
        initial={initialAlt}
        hint="Describa lo que muestra la imagen. Es obligatoria para guardar y ayuda a la accesibilidad y a los buscadores."
      />
      <div className="flex flex-wrap items-center gap-3">
        {/* The label is the button: clicking it opens the file picker, and choosing a file uploads it. */}
        <label
          htmlFor={`${formId}-file`}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-brand-600 px-5 font-semibold text-brand-700 hover:bg-brand-50 focus-within:outline focus-within:outline-3 ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          {busy ? (
            <>
              <Spinner />
              Optimizando y subiendo…
            </>
          ) : (
            <>{path ? "Cambiar imagen" : "Elegir y subir imagen"}</>
          )}
          <input
            id={`${formId}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={upload}
            disabled={busy}
            className="sr-only"
          />
        </label>
        <span className="text-sm text-muted">
          JPG, PNG, WebP o AVIF. Se optimiza automáticamente antes de subirla (máximo 25 MB).
        </span>
        {path && (
          <button
            type="button"
            onClick={() => {
              setPath("");
              setSrc("");
              setMessage(null);
            }}
            className="min-h-11 rounded-full border border-gray-400 px-5"
          >
            Quitar imagen
          </button>
        )}
      </div>
      {busy && <BusyOverlay label="Optimizando y subiendo imagen…" />}
      {message && (
        <p
          role={message.error ? "alert" : "status"}
          className={`rounded-lg p-3 text-sm font-medium ${message.error ? "bg-red-50 text-red-800" : "bg-brand-50 text-brand-800"}`}
        >
          {message.text}
        </p>
      )}
    </fieldset>
  );
}
