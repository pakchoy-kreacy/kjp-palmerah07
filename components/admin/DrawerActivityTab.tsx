import { Clock } from "lucide-react";

const ACTION_LABEL: Record<string, string> = {
  draft_saved: "Simpan Draft",
  document_uploaded: "Upload Dokumen",
  submitted: "Submit",
  revision_given: "Revisi Diberikan",
  verified: "Verifikasi",
};

const ACTOR_LABEL: Record<string, string> = {
  parent: "Orang Tua",
  admin: "Admin",
};

export function DrawerActivityTab({ activities }: { activities: any[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <Clock className="h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3 text-sm">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
          </span>
          <div>
            <p className="font-medium text-gray-700">
              {ACTOR_LABEL[a.actor_type] ?? a.actor_type} ·{" "}
              {ACTION_LABEL[a.action] ?? a.action}
            </p>
            {a.description && (
              <p className="text-gray-500 text-xs">{a.description}</p>
            )}
            <p className="text-xs text-gray-400">
              {new Date(a.created_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
