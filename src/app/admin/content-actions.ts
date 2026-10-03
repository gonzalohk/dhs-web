"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  deleteItem,
  moveItem,
  restoreChange,
  saveCompany,
  saveItem,
  saveText,
  setVisibility,
  uploadImage,
  type ActionState,
  type Deps,
} from "@/lib/content-service";
import type { Entity } from "@/lib/content-schemas";
import { IMAGE_BUCKET, type ImageEntity } from "@/lib/images";
import { isSupabaseConfigured, staffClient } from "@/lib/supabase";
import { getStaff } from "@/lib/staff-session";
import { supabaseContentDb } from "@/lib/supabase-content-db";

// Server Actions of the staff editors (contracts/staff-editor.md). The rules live in
// src/lib/content-service.ts; these wrappers connect them to Supabase and Next.js.

async function deps(): Promise<Deps> {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const staff = await getStaff();
  const supabase = staff?.supabase ?? (await staffClient());
  return {
    getUserId: async () => staff?.id ?? null,
    db: supabaseContentDb(supabase),
    revalidateSite: () => revalidatePath("/", "layout"),
    uploadFile: async (path, bytes, contentType) => {
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, bytes, { contentType });
      if (error) throw error;
    },
  };
}

/** Turns a database error into a message staff can act on (the raw error goes to the server log). */
function friendly(error: unknown): string {
  console.error("Staff action failed", error);
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  if (code === "23505")
    return "Ya existe un elemento con ese valor (por ejemplo la misma dirección web). Use otro.";
  if (code === "23503")
    return "No se pudo guardar porque falta o ya no existe un elemento relacionado (por ejemplo la categoría). Recargue la página.";
  if (code === "42501")
    return "Su cuenta no tiene permiso para esta acción. Pida acceso de personal.";
  return "No se pudo completar la acción. Inténtelo de nuevo.";
}

/** Runs a service call; a database failure becomes an error state instead of a crashed page. */
async function safe(run: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error); // let redirects and other Next.js control-flow errors through
    return { ok: false, formError: friendly(error) };
  }
}

/** Sends signed-out callers to the sign-in page; otherwise returns the state for the form. */
function finish(state: ActionState): ActionState {
  if (state && !state.ok && state.unauthorized) redirect("/admin/login");
  return state;
}

function fields(formData: FormData): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") raw[key] = value;
  return raw;
}

export async function saveCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return finish(await safe(async () => saveCompany(await deps(), fields(formData))));
}

export async function saveTextAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return finish(await safe(async () => saveText(await deps(), fields(formData))));
}

export async function saveItemAction(
  entity: Entity,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return finish(await safe(async () => saveItem(await deps(), entity, fields(formData))));
}

/** Direct call from the image field: returns the uploaded path, or an error message. */
export async function uploadImageAction(
  entity: ImageEntity,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, formError: "Elija una imagen para subir." };
  }
  return finish(await uploadImage(await deps(), entity, file));
}

/** The list actions below are used as <form action>; problems are shown through ?error= on the page. */
function backWithError(returnTo: string, state: ActionState): never | void {
  finish(state);
  if (state && !state.ok && state.formError) {
    redirect(`${returnTo}?error=${encodeURIComponent(state.formError)}`);
  }
}

export async function setVisibilityAction(
  entity: Entity,
  id: string,
  published: boolean,
  returnTo: string,
) {
  backWithError(
    returnTo,
    await safe(async () => setVisibility(await deps(), entity, id, published)),
  );
}

export async function moveItemAction(
  entity: Entity,
  id: string,
  direction: "up" | "down",
  returnTo: string,
) {
  backWithError(returnTo, await safe(async () => moveItem(await deps(), entity, id, direction)));
}

export async function deleteItemAction(entity: Entity, id: string, returnTo: string) {
  backWithError(returnTo, await safe(async () => deleteItem(await deps(), entity, id)));
}

export async function restoreChangeAction(changeId: string) {
  const state = finish(await restoreChange(await deps(), changeId));
  if (state && !state.ok && state.formError) {
    redirect(`/admin/history?error=${encodeURIComponent(state.formError)}`);
  }
  redirect("/admin/history?restored=1");
}
