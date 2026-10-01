import { formatBoPhone } from "./format";
import type { Settings } from "./types";

// Company-data variables usable inside editable page texts, e.g. "Bienvenido a {companyName}".

export const COMPANY_TOKENS = [
  "{companyName}",
  "{tagline}",
  "{phone}",
  "{whatsapp}",
  "{email}",
  "{address}",
  "{city}",
  "{hours}",
] as const;

const TOKEN_PATTERN = /\{[A-Za-z]+\}/g;

/** Tokens in the text that are not part of COMPANY_TOKENS (typos such as "{compnayName}"). */
export function findUnknownTokens(text: string): string[] {
  const known = new Set<string>(COMPANY_TOKENS);
  return [...new Set(text.match(TOKEN_PATTERN) ?? [])].filter((t) => !known.has(t));
}

/** Replaces the known tokens with the company data; text without tokens is returned unchanged. */
export function renderText(text: string, settings: Settings): string {
  const values: Record<string, string> = {
    "{companyName}": settings.companyName,
    "{tagline}": settings.tagline,
    "{phone}": formatBoPhone(settings.phone),
    "{whatsapp}": formatBoPhone(settings.whatsappNumber),
    "{email}": settings.email,
    "{address}": settings.address,
    "{city}": settings.city,
    "{hours}": settings.businessHours,
  };
  return text.replace(TOKEN_PATTERN, (token) => values[token] ?? token);
}

/** True when a value still holds the "[Pendiente]" marker (data the owner has not provided yet). */
export function isPlaceholder(value: string | null | undefined): boolean {
  return Boolean(value && value.includes("[Pendiente]"));
}

const STRING_FIELDS = [
  "tagline",
  "story",
  "mission",
  "address",
  "city",
  "businessHours",
  "deliverySchedule",
  "minimumOrder",
] as const;

const LIST_FIELDS = [
  "values",
  "certifications",
  "clientTypes",
  "serviceAreas",
  "orderingSteps",
] as const;

/**
 * The company data as visitors may see it: values that still hold the "[Pendiente]" marker become empty
 * (strings) or are dropped (list items), so pages can hide those sections instead of showing the marker.
 */
export function publicSettings(settings: Settings): Settings {
  const result = { ...settings };
  for (const field of STRING_FIELDS) if (isPlaceholder(result[field])) result[field] = "";
  for (const field of LIST_FIELDS) result[field] = result[field].filter((v) => !isPlaceholder(v));
  return result;
}

/** Like renderText, but returns null when a used token has no value, so the page can hide the text. */
export function renderTextOrNull(text: string, settings: Settings): string | null {
  const hasEmptyToken = (text.match(TOKEN_PATTERN) ?? []).some(
    (token) => renderText(token, settings) === "",
  );
  return hasEmptyToken ? null : renderText(text, settings);
}
