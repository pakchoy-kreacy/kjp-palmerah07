import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const COPY: Record<
  ApplicationStatus,
  { title: string; desc: string; tone: string }
> = {
  not_started: {
    title: "Belum Mulai",
    desc: "Anda belum mengisi formulir.",
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  draft: {
    title: "Draft",
    desc: "Pengisian belum selesai. Lanjutkan pengisian formulir.",
    tone: "border-warning/30 bg-warning/10 text-warning",
  },
  submitted: {
    title: "Menunggu Verifikasi",
    desc: "Data Anda sedang diperiksa oleh admin.",
    tone: "border-border bg-muted text-foreground",
  },
  needs_revision: {
    title: "Perlu Revisi",
    desc: "Admin meminta perbaikan pada data Anda.",
    tone: "border-warning/30 bg-warning/10 text-warning",
  },
  verified: {
    title: "Terverifikasi",
    desc: "Data Anda telah diverifikasi. Terima kasih.",
    tone: "border-success/30 bg-success/10 text-success",
  },
};

export function StatusCard({
  status,
  revisionNotes,
}: {
  status: ApplicationStatus;
  revisionNotes: string | null;
}) {
  const c = COPY[status];
  return (
    <div className={`rounded-lg border p-4 ${c.tone}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{c.title}</span>
        <Badge variant="outline">{status}</Badge>
      </div>
      <p className="mt-1 text-sm">{c.desc}</p>
      {status === "needs_revision" && revisionNotes && (
        <div className="mt-3 rounded-md border bg-background/60 p-3 text-sm">
          <p className="mb-1 font-medium">Catatan Revisi:</p>
          <p className="whitespace-pre-wrap">{revisionNotes}</p>
        </div>
      )}
    </div>
  );
}
