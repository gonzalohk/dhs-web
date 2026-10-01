"use client";

import { createContext, useActionState, useContext, useId, useState, type ReactNode } from "react";
import type { ActionState } from "@/lib/content-service";

type EditorContextValue = {
  state: ActionState;
  /** Unique per form, so several editors on one page do not share element ids. */
  formId: string;
  /** Current (unsaved) form values, used by fields and the preview. */
  values: Record<string, string>;
};

const EditorContext = createContext<EditorContextValue>({ state: null, formId: "", values: {} });

export const useEditor = () => useContext(EditorContext);

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Values the form starts with (used by the preview before anything is typed). */
  initialValues?: Record<string, string>;
  /** Row id and loaded version; sent with the form so concurrent edits are detected. */
  id?: string;
  updatedAt?: string;
  submitLabel?: string;
  children: ReactNode;
};

/** Shared editor shell: field errors, conflict warning, saving state, success message. */
export function EditorForm({
  action,
  initialValues = {},
  id,
  updatedAt,
  submitLabel = "Guardar cambios",
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [values, setValues] = useState(initialValues);
  const formId = useId();
  const version = state?.ok ? (state.updatedAt ?? updatedAt) : updatedAt;
  const hasFieldErrors = Boolean(state && !state.ok && state.errors);

  return (
    <EditorContext.Provider value={{ state, formId, values }}>
      <form
        action={formAction}
        noValidate
        onInput={(e) => {
          const data = new FormData(e.currentTarget);
          const next: Record<string, string> = {};
          for (const [key, value] of data.entries())
            if (typeof value === "string") next[key] = value;
          setValues(next);
        }}
        className="space-y-5"
      >
        {id && <input type="hidden" name="id" value={id} />}
        {version !== undefined && <input type="hidden" name="updatedAt" value={version} />}

        {children}

        {state && !state.ok && state.formError && (
          <p
            role="alert"
            className={`rounded-lg p-3 font-medium ${state.conflict ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800"}`}
          >
            {state.formError}
          </p>
        )}
        {hasFieldErrors && (
          <p role="alert" className="sr-only">
            Revise los campos marcados.
          </p>
        )}
        {state?.ok && (
          <p role="status" className="rounded-lg bg-brand-50 p-3 font-medium text-brand-800">
            {state.message ?? "Guardado."}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </form>
    </EditorContext.Provider>
  );
}
