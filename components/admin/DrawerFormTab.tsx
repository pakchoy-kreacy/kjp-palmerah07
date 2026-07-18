import { CopyButton } from "@/components/shared/CopyButton";
import { STUDENT_FIELDS, GUARDIAN_FIELDS, EMERGENCY_FIELDS } from "@/lib/form-config";

const LABELS: Record<string, string> = {};
[...STUDENT_FIELDS, ...GUARDIAN_FIELDS, ...EMERGENCY_FIELDS].forEach(
  (f) => (LABELS[f.key] = f.label)
);

function FieldRow({ k, v }: { k: string; v: unknown }) {
  const display =
    v === null || v === undefined || v === ""
      ? "—"
      : String(v);
  return (
    <div className="flex items-start justify-between gap-2 border-b py-2 text-sm">
      <span className="text-muted-foreground">{LABELS[k] ?? k}</span>
      <span className="flex items-center gap-1 text-right">
        <span className="break-all">{display}</span>
        {v !== null && v !== undefined && v !== "" && (
          <CopyButton value={String(v)} label={LABELS[k] ?? k} />
        )}
      </span>
    </div>
  );
}

function Section({
  title,
  data,
}: {
  title: string;
  data: Record<string, any> | null;
}) {
  if (!data) {
    return (
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">Belum diisi.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {Object.entries(data).map(([k, v]) => {
        if (["id", "application_id", "created_at", "updated_at"].includes(k))
          return null;
        return <FieldRow key={k} k={k} v={v} />;
      })}
    </div>
  );
}

export function DrawerFormTab({
  studentData,
  guardianData,
  emergencyContact,
}: {
  studentData: Record<string, any> | null;
  guardianData: Record<string, any> | null;
  emergencyContact: Record<string, any> | null;
}) {
  return (
    <div className="space-y-5">
      <Section title="I. Data Pribadi Siswa" data={studentData} />
      <Section title="II. Data Wali" data={guardianData} />
      <Section title="III. Kontak Darurat" data={emergencyContact} />
    </div>
  );
}
