import Link from "next/link";
import { redirect } from "next/navigation";
import { formatBoPhone } from "@/lib/format";
import { staffClient } from "@/lib/supabase";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { setInquiryStatus, signOut } from "../actions";

const filters = [
  { id: "all", label: "Todas" },
  { id: "new", label: "Nuevas" },
  { id: "handled", label: "Atendidas" },
] as const;

const dateFormat = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/La_Paz",
});

export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  const supabase = await staffClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");

  const status = (await searchParams).status;
  const active = status === "new" || status === "handled" ? status : "all";

  let query = supabase
    .from("inquiries")
    .select("id, created_at, name, email, phone, business_name, message, status")
    .order("created_at", { ascending: false });
  if (active !== "all") query = query.eq("status", active);
  const { data, error } = await query;
  if (error) throw error;

  const inquiries: Inquiry[] = data.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    email: r.email,
    phone: r.phone,
    businessName: r.business_name,
    message: r.message,
    status: r.status as InquiryStatus,
  }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-800">Consultas recibidas</h1>
        <form action={signOut}>
          <button className="min-h-11 rounded-full border border-gray-400 px-4">
            Cerrar sesión
          </button>
        </form>
      </div>

      <nav aria-label="Filtrar por estado" className="mt-6 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={f.id === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${f.id}`}
            aria-current={active === f.id ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-4 ${active === f.id ? "bg-brand-600 text-white" : "border border-brand-100"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {inquiries.length === 0 && <p className="mt-8 text-muted">No hay consultas.</p>}

      <ul className="mt-6 space-y-4">
        {inquiries.map((inq) => (
          <li
            key={inq.id}
            data-testid="inquiry"
            className="rounded-2xl border border-brand-100 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {inq.name}
                  {inq.businessName && (
                    <span className="font-normal text-muted"> · {inq.businessName}</span>
                  )}
                </p>
                <p className="text-sm text-muted">{dateFormat.format(new Date(inq.createdAt))}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${inq.status === "new" ? "bg-accent-400 text-ink" : "bg-brand-50 text-brand-800"}`}
              >
                {inq.status === "new" ? "Nueva" : "Atendida"}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line">{inq.message}</p>
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              {inq.email && (
                <a href={`mailto:${inq.email}`} className="text-brand-700 underline">
                  {inq.email}
                </a>
              )}
              {inq.phone && (
                <a href={`tel:${inq.phone}`} className="text-brand-700 underline">
                  {formatBoPhone(inq.phone)}
                </a>
              )}
            </p>
            <form
              action={setInquiryStatus.bind(null, inq.id, inq.status === "new" ? "handled" : "new")}
              className="mt-4"
            >
              <button className="min-h-11 rounded-full bg-brand-600 px-4 font-medium text-white hover:bg-brand-700">
                {inq.status === "new" ? "Marcar como atendida" : "Marcar como nueva"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
