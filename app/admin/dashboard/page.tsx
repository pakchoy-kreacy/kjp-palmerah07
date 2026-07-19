import Link from "next/link";
import { getDashboardStats, getStudentRows, getActivePeriod } from "@/lib/admin-data";
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
import {
  Download,
  Upload,
  FileSpreadsheet,
  CalendarPlus,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, rows, period] = await Promise.all([
    getDashboardStats(),
    getStudentRows(),
    getActivePeriod(),
  ]);

  const recent = [...rows]
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, 10);

  const needsVerification = rows.filter((r) => r.status === "submitted").length;
  const needsRevision = rows.filter((r) => r.status === "needs_revision").length;
  const readyForInput = rows.filter((r) => r.status === "draft" || r.status === "not_started").length;
  const completed = rows.filter((r) => r.status === "verified").length;
  const total = rows.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const QUICK_ACTIONS = [
    { href: "/admin/students", label: "Import Data", desc: "Upload file Excel siswa", icon: Upload, color: "text-blue-600", bg: "bg-blue-50" },
    { href: "/api/export", label: "Export Data", desc: "Download semua data Excel", icon: Download, color: "text-green-600", bg: "bg-green-50", external: true },
    { href: "/api/export/template", label: "Download Template", desc: "Template Excel untuk import", icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50", external: true },
    { href: "/admin/settings/period", label: "Tambah Periode", desc: "Atur tahun ajaran aktif", icon: CalendarPlus, color: "text-purple-600", bg: "bg-purple-50" },
    { href: "/admin/settings/landing", label: "Landing Page", desc: "Atur halaman utama portal", icon: ExternalLink, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {period ? `Periode ${period.year}` : "Belum ada periode aktif"}
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={stats} />

      {/* Daily Overview + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Daily Overview */}
        <div className="space-y-3 lg:col-span-3">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-red-500" /> Ringkasan Hari Ini
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-red-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900">{needsVerification}</p>
              <p className="text-xs font-medium text-gray-500">Perlu Diverifikasi</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <RefreshCw className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900">{needsRevision}</p>
              <p className="text-xs font-medium text-gray-500">Perlu Revisi</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900">{readyForInput}</p>
              <p className="text-xs font-medium text-gray-500">Siap Diinput</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-red-500" /> Tindakan Cepat
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              const Tag = qa.external ? "a" : Link;
              const props = qa.external
                ? { href: qa.href, download: true }
                : { href: qa.href };
              return (
                <Tag
                  key={qa.label}
                  {...props}
                  className="group rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${qa.bg}`}>
                    <Icon className={`h-4 w-4 ${qa.color}`} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-gray-800 group-hover:text-red-700 transition-colors">{qa.label}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">{qa.desc}</p>
                </Tag>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Pendataan */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">Progress Pendataan</h2>
          <span className="text-xs font-semibold text-gray-500">
            {completed} / {total} siswa
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
          <span>{progressPct}% selesai</span>
          <span>{total - completed} siswa belum verifikasi</span>
        </div>
        {total > 0 && (
          <div className="mt-3 flex items-center gap-1 text-xs text-red-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{(completed / total * 100).toFixed(0)}% siswa sudah terverifikasi</span>
          </div>
        )}
      </div>

      {/* Recent Students */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">10 Siswa Terakhir Update</h2>
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link href="/admin/students">Lihat Semua <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Nama</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">NISN</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Kelas</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-8 w-8 text-gray-200" />
                      <p className="font-medium text-gray-400">Belum ada data siswa</p>
                      <p className="text-xs text-gray-400">Import data siswa untuk memulai</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((r) => (
                  <TableRow key={r.applicationId} className="border-gray-100 transition-colors hover:bg-gray-50">
                    <TableCell className="font-semibold text-gray-800">{r.name}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{r.nisn}</TableCell>
                    <TableCell className="text-sm text-gray-600">{r.class}</TableCell>
                    <TableCell><StatusBadge status={r.status as any} /></TableCell>
                    <TableCell className="text-sm text-gray-400">{relativeTime(r.updatedAt)}</TableCell>
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
