"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { processInquiry, type InquiryDeps, type InquiryResult } from "@/lib/inquiry";
import type { InquiryInput } from "@/lib/schema";
import { isSupabaseConfigured, serviceClient } from "@/lib/supabase";

const FORM_FIELDS = ["name", "email", "phone", "businessName", "message", "website", "startedAt"];

export async function submitInquiry(
  _prev: InquiryResult | null,
  formData: FormData,
): Promise<InquiryResult> {
  const raw = Object.fromEntries(FORM_FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}${ip}`)
    .digest("hex");
  return processInquiry(raw, ipHash, isSupabaseConfigured() ? supabaseDeps() : consoleDeps());
}

function supabaseDeps(): InquiryDeps {
  const db = serviceClient();
  return {
    async countRecent(ipHash) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error } = await db
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since);
      if (error) throw error;
      return count ?? 0;
    },
    async store(input, ipHash) {
      const { data, error } = await db
        .from("inquiries")
        .insert({
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          business_name: input.businessName ?? null,
          message: input.message,
          ip_hash: ipHash,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    sendEmail,
    async markEmailSent(id) {
      await db.from("inquiries").update({ email_sent: true }).eq("id", id);
    },
  };
}

async function sendEmail(input: InquiryInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) throw new Error("RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    replyTo: input.email,
    subject: `Nueva consulta web de ${input.name}`,
    text: [
      `Nombre: ${input.name}`,
      `Negocio: ${input.businessName ?? "-"}`,
      `Correo: ${input.email ?? "-"}`,
      `Teléfono: ${input.phone ?? "-"}`,
      "",
      input.message,
    ].join("\n"),
  });
  if (error) throw new Error(error.message);
}

// Without Supabase, inquiries are only logged. This is allowed in development and in
// end-to-end tests (E2E=1); in production a missing database makes the form report an error.
const recentByIp = new Map<string, number[]>();

function consoleDeps(): InquiryDeps {
  const allowed = process.env.NODE_ENV !== "production" || process.env.E2E === "1";
  return {
    async countRecent(ipHash) {
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return (recentByIp.get(ipHash) ?? []).filter((t) => t > hourAgo).length;
    },
    async store(input, ipHash) {
      if (!allowed) throw new Error("Supabase is not configured");
      recentByIp.set(ipHash, [...(recentByIp.get(ipHash) ?? []), Date.now()]);
      console.info("Inquiry received (not stored, Supabase not configured):", input);
      return { id: crypto.randomUUID() };
    },
    async sendEmail() {}, // no email without Supabase: the inquiry was only logged
    async markEmailSent() {},
  };
}
