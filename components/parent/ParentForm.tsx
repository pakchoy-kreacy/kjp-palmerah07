"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApplication } from "@/hooks/useApplication";
import { FormSection } from "@/components/parent/FormSection";
import { DocumentUpload } from "@/components/parent/DocumentUpload";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STUDENT_FIELDS,
  GUARDIAN_FIELDS,
  EMERGENCY_FIELDS,
} from "@/lib/form-config";

function buildEnabled(
  fields: { key: string }[],
  formFields: { field_key: string; section: string; is_enabled: boolean }[],
  section: "student" | "guardian"
): Set<string> {
  const prefix = section === "student" ? "student_" : "guardian_";
  return new Set(
    fields
      .map((f) => f.key)
      .filter((k) => {
        const setting = formFields.find(
          (s) => s.field_key === prefix + k && s.section === section
        );
        return !setting || setting.is_enabled;
      })
  );
}

function countFilled(
  data: Record<string, any> | null,
  fields: { key: string }[],
  enabled: Set<string>,
  optional: Set<string>
) {
  if (!data) return { done: 0, total: 0 };
  let done = 0;
  let total = 0;
  for (const f of fields) {
    if (!enabled.has(f.key)) continue;
    if (optional.has(f.key)) continue;
    total++;
    const v = data[f.key];
    if (v !== null && v !== undefined && v !== "") done++;
  }
  return { done, total };
}

const STUDENT_OPTIONAL = new Set([
  "npwp","phone_home","disability","identity_expiry","identity_permanent","mail_pickup","address_type","residence_status",
]);
const GUARDIAN_OPTIONAL = new Set([
  "npwp","phone_home","ktp_permanent","ktp_expiry","no_kk","birth_place","birth_date","mother_name","religion","marital_status","employment_status","residence_status","address_type","gender",
]);

export function ParentForm() {
  const router = useRouter();
  const { data, isLoading } = useApplication();
  const [submitting, setSubmitting] = React.useState(false);

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

  // Lock form jika sudah submit/verified (kecuali saat revisi)
  const locked = status === "submitted" || status === "verified";

  const studentEnabled = buildEnabled(STUDENT_FIELDS, formFields, "student");
  const guardianEnabled = buildEnabled(GUARDIAN_FIELDS, formFields, "guardian");
  const emergencyEnabled = new Set(EMERGENCY_FIELDS.map((f) => f.key));

  const s = countFilled(studentData, STUDENT_FIELDS, studentEnabled, STUDENT_OPTIONAL);
  const g = countFilled(guardianData, GUARDIAN_FIELDS, guardianEnabled, GUARDIAN_OPTIONAL);
  const e = countFilled(emergencyContact, EMERGENCY_FIELDS, emergencyEnabled, new Set([
    "id_number","relationship","address","rt","rw","province","city","district","sub_district","postal_code",
  ]));

  const requiredDocs = documentTypes.filter((d: any) => d.is_required);
  const uploadedIds = new Set(documents.map((d: any) => d.document_type_id));
  const missingDocs = requiredDocs.filter((d: any) => !uploadedIds.has(d.id));

  const partsDone = [s.done === s.total && s.total > 0, g.done === g.total && g.total > 0, e.done === e.total && e.total > 0, missingDocs.length === 0 && requiredDocs.length > 0].filter(Boolean).length;
  const totalParts = 4;
  const pct = Math.round((partsDone / totalParts) * 100);

  async function handleSubmit() {
    if (missingDocs.length > 0) {
      toast.error("Dokumen wajib belum lengkap: " + missingDocs.map((d: any) => d.name).join(", "));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/application/${application.id}/submit`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal submit");
        return;
      }
      toast.success("Pengajuan dikirim");
      router.push("/status");
      router.refresh();
    } catch {
      toast.error("Gagal submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{application?.student?.name ?? "Siswa"}</span>
          <span className="text-muted-foreground">
            {partsDone} dari {totalParts} bagian selesai
          </span>
        </div>
        <Progress value={pct} className="mt-2" />
      </div>

      {locked && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          Form sudah terkunci (status: {status}). Lihat status di halaman Status.
        </div>
      )}

      <FormSection
        title="I. Data Pribadi Siswa"
        section="student"
        fields={STUDENT_FIELDS}
        enabledKeys={studentEnabled}
        defaultValues={studentData ?? {}}
      />
      <FormSection
        title="II. Data Wali"
        section="guardian"
        fields={GUARDIAN_FIELDS}
        enabledKeys={guardianEnabled}
        defaultValues={guardianData ?? {}}
      />
      <FormSection
        title="III. Kontak Darurat"
        section="emergency"
        fields={EMERGENCY_FIELDS}
        enabledKeys={emergencyEnabled}
        defaultValues={emergencyContact ?? {}}
      />

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">IV. Upload Dokumen</h2>
        <DocumentUpload documentTypes={documentTypes} documents={documents} />
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-md gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/status")}
          >
            Lihat Status
          </Button>
          <Button
            className="flex-1"
            disabled={locked || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Mengirim..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
