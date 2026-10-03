"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { BusyOverlay, Spinner } from "./Spinner";

type Props = {
  children: ReactNode;
  className?: string;
  /** Text shown (with a spinner) while the action runs. */
  pendingLabel?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * Submit button for admin changes: while the action runs it shows a spinner, blocks the whole screen with
 * a "working" layer, and cannot be pressed twice.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel = "Guardando…",
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        type="submit"
        disabled={disabled || pending}
        aria-busy={pending}
        className={`${className ?? ""} ${pending ? "cursor-wait opacity-80" : ""}`}
        {...rest}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner />
            {pendingLabel}
          </span>
        ) : (
          children
        )}
      </button>
      {pending && <BusyOverlay label={pendingLabel} />}
    </>
  );
}
