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
    return <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>;
  }
  return (
    <ol className="space-y-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3 text-sm">
          <span className="mt-1 text-muted-foreground">🕐</span>
          <div>
            <p className="font-medium">
              {ACTOR_LABEL[a.actor_type] ?? a.actor_type} ·{" "}
              {ACTION_LABEL[a.action] ?? a.action}
            </p>
            {a.description && (
              <p className="text-muted-foreground">{a.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
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
