import { describe, expect, it } from "vitest";
import { settings } from "@/content/placeholder";
import {
  findUnknownTokens,
  isPlaceholder,
  publicSettings,
  renderText,
  renderTextOrNull,
} from "@/lib/tokens";

describe("renderText", () => {
  it("replaces known tokens with the company data", () => {
    expect(renderText("Bienvenido a {companyName}. Llámenos al {phone}.", settings)).toBe(
      "Bienvenido a DHS. Llámenos al +591 5773 4924.",
    );
    expect(renderText("{email}", settings)).toBe("distribuidoradhs2026@gmail.com");
  });

  it("leaves text without tokens unchanged", () => {
    expect(renderText("Sin variables", settings)).toBe("Sin variables");
  });

  it("leaves unknown tokens as they are", () => {
    expect(renderText("Hola {foo}", settings)).toBe("Hola {foo}");
  });
});

describe("findUnknownTokens", () => {
  it("lists tokens that are not company data variables", () => {
    expect(findUnknownTokens("{companyName} {foo} {foo} {compnayName}")).toEqual([
      "{foo}",
      "{compnayName}",
    ]);
  });

  it("returns nothing for valid text", () => {
    expect(findUnknownTokens("{companyName} en {city}")).toEqual([]);
  });
});

describe("isPlaceholder", () => {
  it("detects the pending marker", () => {
    expect(isPlaceholder("[Pendiente] Dirección")).toBe(true);
    expect(isPlaceholder("Av. Real 123")).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
  });
});

describe("publicSettings and renderTextOrNull", () => {
  const raw = {
    ...settings,
    city: "[Pendiente] Ciudad",
    serviceAreas: ["[Pendiente] Zona", "Montero"],
  };

  it("hides values that still hold the pending marker", () => {
    const visible = publicSettings(raw);
    expect(visible.city).toBe("");
    expect(visible.tagline).toBe("");
    expect(visible.serviceAreas).toEqual(["Montero"]);
    expect(visible.companyName).toBe("DHS");
  });

  it("returns null when a used variable has no value, so the page can hide the text", () => {
    const visible = publicSettings(raw);
    expect(renderTextOrNull("Entregamos en {city}.", visible)).toBeNull();
    expect(renderTextOrNull("{companyName} entrega", visible)).toBe("DHS entrega");
    expect(renderTextOrNull("Hola {foo}", visible)).toBe("Hola {foo}");
  });
});
