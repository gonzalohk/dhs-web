"use client";

import { useEditor } from "./EditorForm";

type Props = {
  name: string;
  label: string;
  /** Value stored today (the field shows the submitted value after a failed save). */
  initial?: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  textarea?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
  maxLength?: number;
  step?: string;
};

export function Field({
  name,
  label,
  initial = "",
  type = "text",
  textarea,
  rows = 4,
  required,
  hint,
  maxLength,
  step,
}: Props) {
  const { state, formId, values } = useEditor();
  const id = `${formId}-${name}`;
  const error = state && !state.ok ? state.errors?.[name] : undefined;
  const shown = state?.values?.[name] ?? initial;
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    defaultValue: shown,
    required,
    maxLength,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `mt-1 block w-full rounded-lg border px-3 py-2.5 text-base ${error ? "border-red-700" : "border-gray-400"}`,
  };
  const length = (values[name] ?? shown).length;

  return (
    <div>
      <label htmlFor={id} className="font-medium">
        {label}{" "}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {textarea ? (
        <textarea rows={rows} {...common} />
      ) : (
        <input type={type} step={step} {...common} />
      )}
      {maxLength && (
        <p className="text-right text-xs text-muted" aria-hidden="true">
          {length}/{maxLength}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
