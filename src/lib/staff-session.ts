// Staff session helpers for admin pages and Server Actions. Server-side only.
import { redirect } from "next/navigation";
import { isSupabaseConfigured, staffClient } from "./supabase";

/** Returns the Supabase client acting as the signed-in staff member, or redirects to the sign-in page. */
export async function requireStaff() {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const supabase = await staffClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return { supabase, user: data.user };
}
