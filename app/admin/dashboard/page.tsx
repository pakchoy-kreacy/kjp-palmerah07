import Link from "next/link";
import { getDashboardStats, getStudentRows } from "@/lib/admin-data";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, rows] = await Promise.all([
    getDashboardStats(),
    getStudentRows(),
  ]);

  const recent = [...rows]
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardCards stats={stats} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">10 Siswa Terakhir Update</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/students">Lihat Semua</Link>
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada data siswa.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((r) => (
                  <TableRow key={r.applicationId}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.nisn}</TableCell>
                    <TableCell>{r.class}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status as any} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {relativeTime(r.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
