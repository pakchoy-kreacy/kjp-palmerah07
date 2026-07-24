import { redirect } from "next/navigation";
import Link from "next/link";
import { getParentSession } from "@/lib/parent-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { GradientBackground } from "@/components/GradientBackground";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { siteConfig } from "@/config/site";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const session = await getParentSession();
  if (!session) redirect("/");

  const supabase = createAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", session.applicationId)
    .single();

  if (!application) redirect("/");
  if (application.status !== "submitted" && application.status !== "verified") {
    redirect("/dashboard");
  }

  let studentName: string | undefined;
  const { data: s } = await supabase
    .from("students")
    .select("name")
    .eq("id", application.student_id)
    .maybeSingle();
  studentName = s?.name;

  return (
    <GradientBackground>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="rounded-3xl bg-white/90 backdrop-blur-[20px] p-8 shadow-xl border border-white/50 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="mt-4 text-lg font-bold text-gray-900">Pengajuan Terkirim!</h1>
            <p className="mt-1 text-sm text-gray-500">
              Data {studentName ?? "siswa"} berhasil dikirim ke sekolah.
            </p>

            <div className="mt-5 rounded-xl bg-green-50 border border-green-200 p-3">
              <p className="text-xs font-semibold text-green-800">Apa yang terjadi selanjutnya?</p>
              <ul className="mt-2 space-y-1.5 text-left text-xs text-green-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Pihak sekolah akan memverifikasi data Anda
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Jika ada revisi, Anda akan mendapat notifikasi
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Pantau status di halaman Status
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                href="/status"
                className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative text-sm">Lihat Status</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 text-sm font-bold text-white backdrop-blur-[4px] transition-all duration-200 hover:bg-white/20"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/50">Powered by {siteConfig.school.name}</p>
      </main>
    </GradientBackground>
  );
}
