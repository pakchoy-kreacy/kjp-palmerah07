import { Users, ClipboardCheck, Clock, AlertTriangle } from "lucide-react";

const ICONS = {
  total: Users,
  submitted: ClipboardCheck,
  notStarted: Clock,
  needsRevision: AlertTriangle,
} as const;

export function DashboardCards({
  stats,
}: {
  stats: {
    total: number;
    submitted: number;
    notStarted: number;
    needsRevision: number;
  };
}) {
  const cards = [
    { key: "total" as const, label: "Total Siswa", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "submitted" as const, label: "Sudah Mengisi", value: stats.submitted, color: "text-green-600", bg: "bg-green-50" },
    { key: "notStarted" as const, label: "Belum Mengisi", value: stats.notStarted, color: "text-orange-600", bg: "bg-orange-50" },
    { key: "needsRevision" as const, label: "Perlu Revisi", value: stats.needsRevision, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = ICONS[c.key];
        return (
          <div key={c.key} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${c.bg} p-2.5`}>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}
