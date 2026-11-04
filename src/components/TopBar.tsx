import type { ComponentType } from "react";
import { SOCIAL_LINKS } from "@/lib/brand";
import { whatsappLink } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { ChatIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, TikTokIcon } from "./icons";

/**
 * Thin top bar (Foody template): contact on the left, "Síguenos:" + social icons on the right.
 * It is not sticky, so it scrolls away as the page moves while the Header below stays fixed.
 * Fill in the profile URLs in src/lib/brand.ts; empty ones are hidden.
 */
export function TopBar({ settings }: { settings: Settings }) {
  const socials: { label: string; href: string; Icon: ComponentType<{ className?: string }> }[] = [
    {
      label: "WhatsApp",
      href: whatsappLink(settings.whatsappNumber, "Hola, quisiera información sobre sus productos."),
      Icon: ChatIcon,
    },
  ];
  if (SOCIAL_LINKS.facebook)
    socials.push({ label: "Facebook", href: SOCIAL_LINKS.facebook, Icon: FacebookIcon });
  if (SOCIAL_LINKS.instagram)
    socials.push({ label: "Instagram", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon });
  if (SOCIAL_LINKS.tiktok)
    socials.push({ label: "TikTok", href: SOCIAL_LINKS.tiktok, Icon: TikTokIcon });

  return (
    <div className="bg-brand-800 text-brand-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-sm">
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${settings.email}`}
            className="hidden items-center gap-2 hover:text-white sm:inline-flex"
          >
            <MailIcon className="size-4 shrink-0" />
            <span className="break-all">{settings.email}</span>
          </a>
          <a
            href={`tel:${settings.phone}`}
            className="hidden items-center gap-2 hover:text-white md:inline-flex"
          >
            <PhoneIcon className="size-4 shrink-0" />
            {settings.phone}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-medium">Síguenos:</span>
          <ul className="flex items-center gap-1.5">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent-500 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
