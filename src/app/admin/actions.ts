"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changeInquiryStatus } from "@/lib/admin";
import { isSupabaseConfigured, staffClient } from "@/lib/supabase";
import { getStaff } from "@/lib/staff-session";

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const supabase = await staffClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  redirect(error ? "/admin/login?error=1" : "/admin");
}

export async function signOut() {
  const supabase = await staffClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setInquiryStatus(id: string, status: string) {
  const staff = await getStaff();
  const supabase = staff?.supabase ?? (await staffClient());
  const result = await changeInquiryStatus(
    {
      getUserId: async () => staff?.id ?? null,
      update: async (inquiryId, patch) => {
        const { error } = await supabase.from("inquiries").update(patch).eq("id", inquiryId);
        if (error) throw error;
      },
    },
    id,
    status,
  );
  if (!result.ok && result.error === "unauthorized") redirect("/admin/login");
  revalidatePath("/admin/inquiries");
}
