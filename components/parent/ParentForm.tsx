"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Send, FileText, Users, Phone,
  Upload, Eye, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { useApplication, ApplicationPayload } from "@/hooks/useApplication";
import { FormSection, type FormSectionHandle } from "@/components/parent/FormSection";
import { DocumentUpload } from "@/components/parent/DocumentUpload";
import { Stepper } from "@/components/parent/Stepper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STUDENT_FIELDS,
  GUARDIAN_FIELDS,
  EMERGENCY_FIELDS,
} from "@/lib/form-config";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatBytes } from "@/lib/utils";

type Step = "student" | "guardian" | "emergency" | "documents" | "review";

const STEPS: { key: Step; number: number; label: string; icon: React.ElementType }[] = [
  { key: "student", number: 1, label: "Data Siswa", icon: FileText },
  { key: "guardian", number: 2, label: "Data Wali", icon: Users },
  { key: "emergency", number: 3, label: "Kontak Darurat", icon: Phone },
  { key: "documents", number: 4, label: "Upload Dokumen", icon: Upload },
  { key: "review", number: 5, label: "Review & Kirim", icon: Eye },
];

const STEP_INDEX: Record<Step, number> = { student: 0, guardian: 1, emergency: 2, documents: 3, review: 4 };

function countFilled(
  data: Record<string, any> | null,
  optional: Set<string>
) {
  if (!data) return { done: 0, total: 0 };
  const keys = Object.keys(data);
  let done = 0;
  let total = 0;
  for (const k of keys) {
    if (optional.has(k)) continue;
    total++;
    const v = data[k];
    if (v !== null && v !== undefined && v !== "" && v !== false) done++;
  }
  return { done, total };
}

export function ParentForm() {
  const router = useRouter();
  const { data, isLoading, refetch } = useApplication();
  const [submitting, setSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<Step>("student");
  const [saving, setSaving] = React.useState<Step | null>(null);
  const sectionRef = React.useRef<FormSectionHandle>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-destructive">Gagal memuat data.</p>;
  }

  const { application, studentData, guardianData, emergencyContact, formFields, documentTypes, documents } = data;
  const status = application?.status as string;
  const locked = status === "submitted" || status === "verified";

  const enabledFromSettings = (section: "student" | "guardian" | "emergency", fields: typeof STUDENT_FIELDS) =>
    new Set(fields.filter((field) => formFields.find((setting: any) => setting.section === section && setting.field_key === field.key)?.is_enabled !== false).map((field) => field.key));
  const studentEnabled = enabledFromSettings("student", STUDENT_FIELDS);
  const guardianEnabled = enabledFromSettings("guardian", GUARDIAN_FIELDS);
  const emergencyEnabled = enabledFromSettings("emergency", EMERGENCY_FIELDS);

  const STUDENT_OPTIONAL = new Set([
    "npwp","identity_expiry","identity_permanent","phone_home","address_type","residence_status","disability","mail_pickup",
  ]);
  const GUARDIAN_OPTIONAL = new Set([
    "ktp_expiry","ktp_permanent","npwp","no_kk","birth_date","gender","religion","mother_name",
    "marital_status","employment_status","residence_status","phone_home","address_type",
  ]);
  const EMERGENCY_OPTIONAL = new Set([
    "id_number","relationship","address","rt","rw",
    "province","city","district","sub_district","postal_code","phone",
  ]);

  const studentFilled = countFilled(studentData, STUDENT_OPTIONAL);
  const guardianFilled = countFilled(guardianData, GUARDIAN_OPTIONAL);
  const emergencyFilled = countFilled(emergencyContact, EMERGENCY_OPTIONAL);

  const requiredDocs = documentTypes.filter((d: any) => d.is_required);
  const uploadedIds = new Set(documents.map((d: any) => d.document_type_id));
  const missingDocs = requiredDocs.filter((d: any) => !uploadedIds.has(d.id));
  const docsComplete = missingDocs.length === 0;

  function getStepStatus(step: Step): "empty" | "partial" | "complete" {
    if (step === "documents") {
      if (requiredDocs.length === 0) return "complete";
      return docsComplete ? "complete" : documents.length > 0 ? "partial" : "empty";
    }
    if (step === "review") return "complete";
    const filled = { student: studentFilled, guardian: guardianFilled, emergency: emergencyFilled }[step];
    if (!filled || filled.total === 0) return "empty";
    if (filled.done === 0) return "empty";
    if (filled.done < filled.total) return "partial";
    return "complete";
  }

  const stepStatuses = {
    student: getStepStatus("student"),
    guardian: getStepStatus("guardian"),
    emergency: getStepStatus("emergency"),
    documents: getStepStatus("documents"),
    review: getStepStatus("review"),
  };

  async function saveSection(section: Step) {
    if (section === "documents" || section === "review") return;
    if (sectionRef.current) {
      setSaving(section);
      const saved = await sectionRef.current.validateAndSave();
      setSaving(null);
      return saved;
    }
    setSaving(section);
    try {
      const dataToSave = {
        student: studentData ?? {},
        guardian: guardianData ?? {},
        emergency: emergencyContact ?? {},
      }[section];
      const res = await fetch("/api/application", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data: dataToSave }),
      });
      if (!res.ok) throw new Error();
      const label = { student: "Data siswa", guardian: "Data wali", emergency: "Kontak darurat" }[section];
      toast.success(`${label} tersimpan`);
      return true;
    } catch {
      toast.error(`Gagal menyimpan data ${section}`);
      return false;
    } finally {
      setSaving(null);
    }
  }

  async function goNext() {
    if (locked) return;
    const saved = await saveSection(currentStep);
    if (saved === false) return;
    const idx = STEP_INDEX[currentStep];
    const nextKey = STEPS[idx + 1]?.key;
    if (nextKey) setCurrentStep(nextKey);
  }

  function goPrev() {
    const idx = STEP_INDEX[currentStep];
    const prevKey = STEPS[idx - 1]?.key;
    if (prevKey) setCurrentStep(prevKey);
  }

  async function handleSubmit() {
    if (missingDocs.length > 0) {
      toast.error("Dokumen wajib belum lengkap: " + missingDocs.map((d: any) => d.name).join(", "));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/application/${application.id}/submit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal submit");
        return;
      }
      toast.success("Pengajuan berhasil dikirim!");
      router.push("/success");
      router.refresh();
    } catch {
      toast.error("Gagal submit");
    } finally {
      setSubmitting(false);
    }
  }

  const currentIdx = STEP_INDEX[currentStep];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === STEPS.length - 1;

  function ErrorSummary({ text }: { text: string }) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="text-xs font-medium">{text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Fixed top bar */}
      <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-bold text-gray-800 truncate">
            Selamat mengisi, Orangtua dari {application?.student?.name ?? "Siswa"} kelas {application?.student?.class ?? "-"}
          </h1>
          {locked && <StatusBadge status={status as any} />}
        </div>
        <Stepper steps={STEPS.map((s) => ({ number: s.number, label: s.label }))} currentStep={STEP_INDEX[currentStep] + 1} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto max-w-lg space-y-4">
          {locked && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Form sudah terkunci (status: {status}). Silakan lihat status di halaman Status.
            </div>
          )}

          {/* Step 1: Student */}
          {currentStep === "student" && (
            <FormSection
              title="I. Data Pribadi Siswa"
              section="student"
              fields={STUDENT_FIELDS}
              enabledKeys={studentEnabled}
              defaultValues={studentData ?? {}}
              ref={sectionRef}
            />
          )}

          {/* Step 2: Guardian */}
          {currentStep === "guardian" && (
            <FormSection
              title="II. Data Wali"
              section="guardian"
              fields={GUARDIAN_FIELDS}
              enabledKeys={guardianEnabled}
              defaultValues={guardianData ?? {}}
              ref={sectionRef}
            />
          )}

          {/* Step 3: Emergency */}
          {currentStep === "emergency" && (
            <FormSection
              title="III. Kontak Darurat"
              section="emergency"
              fields={EMERGENCY_FIELDS}
              enabledKeys={emergencyEnabled}
              defaultValues={emergencyContact ?? {}}
              ref={sectionRef}
            />
          )}

          {/* Step 4: Documents */}
          {currentStep === "documents" && (
            <section className="space-y-3 rounded-lg border bg-card p-4">
              <h2 className="text-base font-semibold">IV. Upload Dokumen</h2>
              <p className="text-xs text-muted-foreground">
                Unggah dokumen yang diperlukan. Format: PDF (maks. 2MB per file).
              </p>
              <DocumentUpload documentTypes={documentTypes} documents={documents} />
            </section>
          )}

          {/* Step 5: Review */}
          {currentStep === "review" && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Review & Kirim
              </h2>

              {/* Student Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-red-500" /> Data Siswa
                </h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  {studentFilled.done > 0 ? (
                    <p>{studentFilled.done}/{studentFilled.total} field terisi</p>
                  ) : (
                    <p className="text-amber-600 font-medium">Belum diisi</p>
                  )}
                </div>
              </div>

              {/* Guardian Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-500" /> Data Wali
                </h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  {guardianFilled.done > 0 ? (
                    <p>{guardianFilled.done}/{guardianFilled.total} field terisi</p>
                  ) : (
                    <p className="text-gray-400">Tidak diisi (opsional)</p>
                  )}
                </div>
              </div>

              {/* Emergency Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-purple-500" /> Kontak Darurat
                </h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  {emergencyFilled.done > 0 ? (
                    <p>{emergencyFilled.done}/{emergencyFilled.total} field terisi</p>
                  ) : (
                    <p className="text-gray-400">Tidak diisi (opsional)</p>
                  )}
                </div>
              </div>

              {/* Documents Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-green-500" /> Dokumen
                </h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  {documentTypes.length > 0 ? (
                    documentTypes.map((dt: any) => {
                      const up = documents.find((d: any) => d.document_type_id === dt.id);
                      return (
                        <div key={dt.id} className="flex items-center justify-between py-0.5">
                          <span className="flex items-center gap-1">
                            {up ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                            )}
                            {dt.name}
                          </span>
                          <span className="text-gray-400">{up ? up.file_name : "—"}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400">Tidak ada dokumen yang diperlukan</p>
                  )}
                </div>
              </div>

              {/* Errors */}
              {missingDocs.length > 0 && (
                <ErrorSummary text={`Dokumen wajib belum diupload: ${missingDocs.map((d: any) => d.name).join(", ")}`} />
              )}
              {studentFilled.done === 0 && (
                <ErrorSummary text="Data siswa belum diisi. Silakan lengkapi terlebih dahulu." />
              )}
            </section>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed inset-x-0 bottom-0 border-t bg-white px-4 pb-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* WA Help */}
        <div className="mx-auto mb-2 max-w-lg text-center">
          <a
            href="https://wa.me/6285814328683?text=Permisi%20Bu%2C%20saya%20ada%20kendala%20terkait%20pengisian%20form%20di%20bagian%20..."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:text-gray-800"
          >
            Terkendala pengisian?
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp
            </span>
          </a>
        </div>
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </Button>

          <div className="text-xs text-gray-400 font-medium">
            {currentIdx + 1} / {STEPS.length}
          </div>

          {isLast ? (
            <Button
              size="sm"
              disabled={locked || submitting}
              onClick={handleSubmit}
              className="gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</>
              ) : (
                <><Send className="h-4 w-4" /> Kirim</>
              )}
            </Button>
          ) : (
             <Button
               size="sm"
               onClick={goNext}
               disabled={locked || saving !== null}
              className="gap-1"
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
