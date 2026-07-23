import { redirect } from "next/navigation";
import { getParentSession } from "@/lib/parent-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusCard } from "@/components/parent/StatusCard";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const session = await getParentSession();
  if (!session) redirect("/");

  const supabase = createAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*, student:students(name, class)")
    .eq("id", session.applicationId)
    .single();
  const { data: documents } = await supabase
    .from("document_uploads")
    .select("*, document_type:document_types(name)")
    .eq("application_id", session.applicationId);
  const { data: docTypes } = await supabase
    .from("document_types")
    .select("id, name, is_required")
    .eq("is_active", true);

  const status = application?.status as any;
  const student = application?.student;

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{student?.name}</h1>
          <p className="text-sm text-muted-foreground">Kelas {student?.class}</p>
        </div>
        <LogoutButton redirectTo="/dashboard" />
      </div>

      <StatusCard
        status={status}
        revisionNotes={application?.revision_notes ?? null}
      />

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Dokumen</h2>
        {docTypes?.length ? (
          docTypes.map((dt: any) => {
            const up = documents?.find((d: any) => d.document_type_id === dt.id);
            return (
              <div
                key={dt.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>{dt.name}</span>
                <span className="text-muted-foreground">
                  {up ? up.file_name : "—"}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada dokumen.</p>
        )}
      </div>

      {(status === "draft" || status === "needs_revision") && (
        <Button asChild className="mt-2 w-full">
          <Link href="/form">
            {status === "needs_revision" ? "Perbaiki Data" : "Lanjutkan Pengisian"}
          </Link>
        </Button>
      )}
    </main>
  );
}
