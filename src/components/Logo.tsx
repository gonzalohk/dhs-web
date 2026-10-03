import Image from "next/image";
import Link from "next/link";
import logoFooter from "@/assets/brand/logo-footer.png";
import { COMPANY_FULL_NAME } from "@/lib/brand";
import { HeaderLogo } from "./HeaderLogo";

type Props = {
  variant: "header" | "footer";
  /** Short company name shown next to the icon in the header. */
  name?: string;
};

/**
 * The DHS logo (Distribuidora Hernández Sanjinés). The header shows only the logo mark (the name appears as text if the image fails to load); the
 * footer shows the full logo inside a white rounded container so its navy parts stay legible on the
 * dark footer.
 */
export function Logo({ variant, name = "DHS" }: Props) {
  const label = `${name}, ${COMPANY_FULL_NAME}, inicio`;
  if (variant === "header") {
    return (
      <Link
        href="/"
        aria-label={label}
        className="flex min-h-11 min-w-0 items-center gap-2 font-bold text-brand-700 sm:text-lg"
      >
        <HeaderLogo name={name} />
      </Link>
    );
  }
  return (
    <Link href="/" aria-label={label} className="inline-block rounded-2xl bg-white p-4 shadow-sm">
      <Image src={logoFooter} alt="" sizes="176px" loading="eager" className="h-auto w-44" />
    </Link>
  );
}
