import { getStudentRows } from "@/lib/admin-data";
import { StudentTable } from "@/components/admin/StudentTable";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const rows = await getStudentRows();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Data Siswa</h1>
      <StudentTable initialRows={rows} />
    </div>
  );
}
