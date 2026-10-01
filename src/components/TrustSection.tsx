import type { Settings, Testimonial } from "@/lib/types";
import { CheckIcon } from "./icons";

/** Certifications, client types and testimonials (trust signals). */
export function TrustSection({
  settings,
  testimonials,
}: {
  settings: Settings;
  testimonials: Testimonial[];
}) {
  return (
    <section aria-labelledby="trust-title" className="mx-auto max-w-6xl px-4 py-14">
      <h2 id="trust-title" className="text-2xl font-bold text-brand-800 sm:text-3xl">
        Confían en nosotros
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div>
          <h3 className="font-semibold">Certificaciones y calidad</h3>
          <ul className="mt-3 space-y-2">
            {settings.certifications.map((c) => (
              <li key={c} className="flex items-start gap-2 text-muted">
                <CheckIcon className="mt-0.5 size-5 shrink-0 text-brand-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">A quiénes atendemos</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {settings.clientTypes.map((t) => (
              <li key={t} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4" data-testid="testimonials">
          {testimonials.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <blockquote className="text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-2 text-sm text-muted">— {t.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
