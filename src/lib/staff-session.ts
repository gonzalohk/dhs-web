// Staff session helpers for admin pages and Server Actions. Server-side only.
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, staffClient } from "./supabase";

/**
 * The signed-in staff member, or null. Memoized per request (layout, page, and action share one lookup)
 * and verified from the session token with getClaims(), which checks the JWT signature locally instead of
 * calling the Auth server each time (that call made every admin action several round trips slower).
 * Writes are additionally protected by Row Level Security in the database.
 */
export const getStaff = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await staffClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { supabase, id } : null;
});

/** Returns the Supabase client acting as the signed-in staff member, or redirects to the sign-in page. */
export async function requireStaff() {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return { supabase: staff.supabase, user: { id: staff.id } };
}
