import { getStudentRows } from "@/lib/admin-data";
import { StudentTable } from "@/components/admin/StudentTable";
import { DashboardCards } from "@/components/admin/DashboardCards";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const rows = await getStudentRows();

  const stats = {
    total: rows.length,
    submitted: rows.filter((r) => r.status === "submitted" || r.status === "verified").length,
    notStarted: rows.filter((r) => r.status === "not_started").length,
    needsRevision: rows.filter((r) => r.status === "needs_revision").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola data peserta didik dan dokumen pendaftaran KJP Plus</p>
      </div>
      <DashboardCards stats={stats} />
      <StudentTable initialRows={rows} />
    </div>
  );
}
