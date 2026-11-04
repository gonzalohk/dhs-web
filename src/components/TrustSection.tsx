import type { Settings, Testimonial } from "@/lib/types";
import { CheckIcon } from "./icons";
import { SectionTitle } from "./SectionTitle";
import { TestimonialCarousel } from "./TestimonialCarousel";

/**
 * Certifications, client types and testimonials (trust signals). Each block appears only when it has
 * content, so nothing unverified or pending is ever shown.
 */
export function TrustSection({
  settings,
  testimonials,
}: {
  settings: Settings;
  testimonials: Testimonial[];
}) {
  const hasCertifications = settings.certifications.length > 0;
  const hasClients = settings.clientTypes.length > 0;
  const hasTestimonials = testimonials.length > 0;
  if (!hasCertifications && !hasClients && !hasTestimonials) return null;

  return (
    <section aria-labelledby="trust-title" className="mx-auto max-w-6xl px-4 py-16">
      <SectionTitle id="trust-title" eyebrow="Testimonios" title="Confían en nosotros" />

      {(hasCertifications || hasClients) && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {hasCertifications && (
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-800">
                Certificaciones y calidad
              </h3>
              <ul className="mt-3 space-y-2">
                {settings.certifications.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-muted">
                    <CheckIcon className="mt-0.5 size-5 shrink-0 text-brand-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasClients && (
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-800">
                A quiénes atendemos
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {settings.clientTypes.map((t) => (
                  <li key={t} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hasTestimonials && (
        <div className="mt-12">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      )}
    </section>
  );
}
