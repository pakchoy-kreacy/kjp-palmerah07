import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types";

const STATUS_MAP: Record<
  ApplicationStatus,
  { label: string; variant: "destructive" | "warning" | "success" | "secondary" | "default" }
> = {
  not_started: { label: "Belum Mulai", variant: "destructive" },
  draft: { label: "Draft", variant: "warning" },
  submitted: { label: "Menunggu", variant: "secondary" },
  needs_revision: { label: "Perlu Revisi", variant: "warning" },
  verified: { label: "Terverifikasi", variant: "success" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export { STATUS_MAP };
