import { redirect } from "next/navigation";
import Link from "next/link";
import { getParentSession } from "@/lib/parent-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusCard } from "@/components/parent/StatusCard";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/GradientBackground";
import { GlassCard } from "@/components/GlassCard";
import { SafeImage } from "@/components/shared/SafeImage";
import { siteConfig } from "@/config/site";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const session = await getParentSession();
  if (!session) redirect("/");

  const supabase = createAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", session.applicationId)
    .single();

  let student: any = null;
  if (application) {
    const { data: s } = await supabase
      .from("students")
      .select("name, class")
      .eq("id", application.student_id)
      .maybeSingle();
    student = s;
  }

  const { data: documents } = await supabase
    .from("document_uploads")
    .select("*")
    .eq("application_id", session.applicationId);
  const { data: docTypes } = await supabase
    .from("document_types")
    .select("id, name, is_required")
    .eq("is_active", true);

  const docTypeMap = new Map((docTypes ?? []).map((d: any) => [d.id, d]));
  const docsWithType = (documents ?? []).map((d: any) => ({
    ...d,
    document_type: docTypeMap.get(d.document_type_id) ?? null,
  }));

  const status = application?.status as any;

  return (
    <GradientBackground>
      <main className="flex flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SafeImage
              src="/assets/logo.png"
              alt={siteConfig.school.name}
              className="h-10 w-10 rounded-full object-cover shadow-md"
            />
            <div>
              <h1 className="text-sm font-bold text-white">{siteConfig.app.name}</h1>
              <p className="text-[10px] text-white/60">{siteConfig.school.name}</p>
            </div>
          </div>
          <LogoutButton redirectTo="/dashboard" />
        </div>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700">
              {student?.name?.charAt(0) ?? "S"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 truncate">{student?.name}</h2>
              <p className="text-xs text-gray-500">Kelas {student?.class ?? "-"}</p>
            </div>
          </div>

          <StatusCard
            status={status}
            revisionNotes={application?.revision_notes ?? null}
          />

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Dokumen</h3>
            <div className="space-y-2">
              {docTypes?.length ? (
                docTypes.map((dt: any) => {
                  const up = docsWithType?.find((d: any) => d.document_type_id === dt.id);
                  return (
                    <div
                      key={dt.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-gray-700">{dt.name}</span>
                      <span className="text-xs text-gray-400">
                        {up ? up.file_name : "Belum diupload"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">Belum ada dokumen.</p>
              )}
            </div>
          </div>

          {(status === "draft" || status === "needs_revision") && (
            <Button asChild className="w-full">
              <Link href="/form">
                {status === "needs_revision" ? "Perbaiki Data" : "Lanjutkan Pengisian"}
              </Link>
            </Button>
          )}
        </GlassCard>

        <p className="mt-auto pt-4 text-center text-[10px] text-white/40">
          {siteConfig.app.name} v{siteConfig.app.version}
        </p>
      </main>
    </GradientBackground>
  );
}
