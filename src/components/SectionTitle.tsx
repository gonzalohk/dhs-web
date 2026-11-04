import type { ReactNode } from "react";

type Props = {
  /** Small coloured label above the title (Foody's section eyebrow). */
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "start";
  /** Id for the heading, so sections can reference it with aria-labelledby. */
  id?: string;
  as?: "h1" | "h2";
};

/**
 * Section heading in the Foody style: two short accent bars (green over orange) above an
 * optional eyebrow, a Lora serif title, and an optional intro line. Keeps the DHS navy palette.
 */
export function SectionTitle({ eyebrow, title, intro, align = "start", id, as: Heading = "h2" }: Props) {
  const center = align === "center";
  return (
    <div className={center ? "text-center" : ""}>
      <div className={`section-bars ${center ? "" : "section-bars--start"}`}>
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-accent-700 uppercase">{eyebrow}</p>
        )}
        <Heading
          id={id}
          className="mt-1 font-display text-2xl font-bold text-brand-800 sm:text-3xl"
        >
          {title}
        </Heading>
      </div>
      {intro && (
        <p className={`mt-3 max-w-2xl text-muted ${center ? "mx-auto" : ""}`}>{intro}</p>
      )}
    </div>
  );
}
