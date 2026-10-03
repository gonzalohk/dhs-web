import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

// Staff pages depend on the signed-in session, so they are never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Área de personal",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
