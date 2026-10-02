import Image from "next/image";
import Link from "next/link";
import logoFull from "@/assets/brand/logo-dhs.svg";
import logoIcon from "@/assets/brand/logo-icon.png";
import { COMPANY_FULL_NAME } from "@/lib/brand";

type Props = {
  variant: "header" | "footer";
  /** Short company name shown next to the icon in the header. */
  name?: string;
};

/**
 * The DHS logo (Distribuidora Hernández Sanjinés). The header shows the cube icon next to the name; the
 * footer shows the full vector logo inside a white rounded container so its navy parts stay legible on the
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
        <Image src={logoIcon} alt="" width={44} height={44} priority className="size-11 shrink-0" />
        <span className="truncate">{name}</span>
      </Link>
    );
  }
  return (
    <Link href="/" aria-label={label} className="inline-block rounded-2xl bg-white p-4 shadow-sm">
      <Image src={logoFull} alt="" width={176} height={147} className="h-auto w-44" />
    </Link>
  );
}
