import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await requireAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
