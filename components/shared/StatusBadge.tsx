import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUS_MAP: Record<
  ApplicationStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  not_started: {
    label: "Belum Mengisi",
    dot: "bg-gray-400",
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
  draft: {
    label: "Draft",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  submitted: {
    label: "Menunggu",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  needs_revision: {
    label: "Perlu Revisi",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  verified: {
    label: "Lengkap",
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, dot, bg, text } = STATUS_MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", bg, text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

export { STATUS_MAP };
