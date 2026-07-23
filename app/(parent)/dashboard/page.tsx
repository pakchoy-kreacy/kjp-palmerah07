import { redirect } from "next/navigation";
import Link from "next/link";
import { getParentSession } from "@/lib/parent-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { GradientBackground } from "@/components/GradientBackground";
import { SafeImage } from "@/components/shared/SafeImage";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { siteConfig } from "@/config/site";
import type { ApplicationStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
      .select("*")
      .eq("id", application.student_id)
      .maybeSingle();
    student = s;
  }

  if (!application) {
    return <div className="p-4 text-sm text-destructive">Data tidak ditemukan.</div>;
  }

  const status = application.status as ApplicationStatus;
  const isFormEditable = status === "not_started" || status === "draft" || status === "needs_revision";

  return (
    <GradientBackground>
      <main className="flex flex-1 flex-col px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <LogoutButton />
        </div>

        {/* Welcome Card */}
        <div className="mt-4 rounded-2xl bg-white/90 backdrop-blur-[12px] p-5 shadow-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-700">
              {student?.name?.charAt(0) ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-500">Halo,</p>
              <h2 className="text-lg font-bold text-gray-900 truncate">{student?.name ?? "Siswa"}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">
                  NISN: {session.nisn} · Kelas {student?.class ?? "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <StatusBadge status={status} />
          </div>

          {application.revision_notes && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold text-xs">Catatan Revisi:</p>
              <p className="text-xs mt-0.5">{application.revision_notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 space-y-2">
          {isFormEditable && (
            <Link
              href="/form"
              className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 font-bold text-white shadow-md shadow-red-200/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="relative text-sm">
                {status === "needs_revision" ? "Perbaiki Data" : "Lanjutkan Pengisian"}
              </span>
            </Link>
          )}

          <Link
            href="/status"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow"
          >
            Lihat Status Pengajuan
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-auto pt-4 text-center text-[10px] text-white/40">
          {siteConfig.app.name} v{siteConfig.app.version}
        </p>
      </main>
    </GradientBackground>
  );
}
