import { Card, CardContent } from "@/components/ui/card";

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
    { label: "Total Siswa", value: stats.total, tone: "text-foreground" },
    {
      label: "Sudah Submit",
      value: stats.submitted,
      tone: "text-blue-600",
    },
    { label: "Belum Mulai", value: stats.notStarted, tone: "text-destructive" },
    {
      label: "Perlu Revisi",
      value: stats.needsRevision,
      tone: "text-warning",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={`mt-1 text-3xl font-bold ${c.tone}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
