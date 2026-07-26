import { createAdminClient } from "@/lib/supabase/admin";
import { ReferensiTable } from "@/components/admin/ReferensiTable";

export const dynamic = "force-dynamic";

export default async function ReferensiPage() {
  const supabase = createAdminClient();
  const { data: students } = await supabase
    .from("students")
    .select("nisn, name, class")
    .order("name", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Data Referensi</h1>
        <p className="mt-0.5 text-sm text-gray-500">Daftar siswa hasil import untuk pengecekan NISN</p>
      </div>
      <ReferensiTable initialRows={students ?? []} />
    </div>
  );
}
