"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiry } from "@/app/contact/actions";
import type { InquiryResult } from "@/lib/inquiry";
import type { InquiryField } from "@/lib/schema";

type FieldProps = {
  name: InquiryField;
  label: string;
  state: InquiryResult | null;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  textarea?: boolean;
};

function Field({
  name,
  label,
  state,
  type = "text",
  autoComplete,
  required,
  hint,
  textarea,
}: FieldProps) {
  const error = state && !state.ok ? state.errors?.[name] : undefined;
  const value = state && !state.ok ? state.values?.[name] : undefined;
  const describedBy =
    [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id: name,
    name,
    defaultValue: value,
    autoComplete,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `mt-1 block w-full rounded-lg border px-3 py-2.5 text-base ${error ? "border-red-700" : "border-gray-400"}`,
  };
  return (
    <div>
      <label htmlFor={name} className="font-medium">
        {label}{" "}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {textarea ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, null);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  if (state?.ok) {
    return (
      <div role="status" className="rounded-2xl bg-brand-50 p-6">
        <p className="text-lg font-semibold text-brand-800">¡Gracias! Recibimos su mensaje.</p>
        <p className="mt-1 text-muted">
          Le responderemos en horario de atención, normalmente el mismo día.
        </p>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        formData.set("startedAt", String(startedAt.current));
        formAction(formData);
      }}
      noValidate
      className="space-y-4"
    >
      <Field name="name" label="Nombre" state={state} autoComplete="name" required />
      <Field
        name="businessName"
        label="Nombre del negocio"
        state={state}
        autoComplete="organization"
      />
      <Field
        name="email"
        label="Correo electrónico"
        type="email"
        state={state}
        autoComplete="email"
        hint="Indique su correo o su teléfono."
      />
      <Field
        name="phone"
        label="Teléfono o celular"
        type="tel"
        state={state}
        autoComplete="tel"
        hint="Ejemplo: 70000000"
      />
      <Field name="message" label="Mensaje" state={state} required textarea />

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">No llenar</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state && !state.ok && state.formError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 font-medium text-red-800">
          {state.formError}
        </p>
      )}
      {state && !state.ok && state.errors && (
        <p role="alert" className="sr-only">
          Revise los campos marcados.
        </p>
      )}

      <p className="text-sm text-muted">
        Usamos sus datos solo para responder su consulta. Más detalles en el{" "}
        <a href="#privacidad" className="underline">
          aviso de privacidad
        </a>
        .
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
