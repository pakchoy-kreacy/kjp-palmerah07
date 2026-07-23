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
    draft: number;
    notStarted: number;
    needsRevision: number;
  };
}) {
  const filled = stats.submitted;
  const perluRevisi = stats.draft + stats.needsRevision;
  const cards = [
    {
      key: "total" as const,
      label: "Total Siswa",
      value: stats.total,
      accent: "text-blue-600",
      bg: "bg-blue-50/60",
      iconBg: "bg-blue-100/80",
    },
    {
      key: "submitted" as const,
      label: "Sudah Mengisi",
      value: filled,
      accent: "text-green-600",
      bg: "bg-green-50/60",
      iconBg: "bg-green-100/80",
    },
    {
      key: "needsRevision" as const,
      label: "Perlu Revisi",
      value: perluRevisi,
      accent: "text-red-600",
      bg: "bg-red-50/60",
      iconBg: "bg-red-100/80",
    },
    {
      key: "notStarted" as const,
      label: "Belum Mengisi",
      value: stats.notStarted,
      accent: "text-orange-600",
      bg: "bg-orange-50/60",
      iconBg: "bg-orange-100/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = ICONS[c.key];
        return (
          <div
            key={c.key}
            className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${c.bg}`}
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${c.iconBg} p-2.5`}>
                <Icon className={`h-5 w-5 ${c.accent}`} />
              </div>
              {c.key === "total" && (
                <div className="flex h-6 items-center rounded-full bg-blue-50 px-2 text-[10px] font-semibold text-blue-600">
                  {filled > 0
                    ? `${Math.round((filled / (stats.total || 1)) * 100)}%`
                    : "0%"}
                </div>
              )}
              {c.key === "submitted" && stats.total > 0 && (
                <div className="flex h-6 items-center rounded-full bg-green-50 px-2 text-[10px] font-semibold text-green-600">
                  {Math.round((filled / stats.total) * 100)}%
                </div>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}
