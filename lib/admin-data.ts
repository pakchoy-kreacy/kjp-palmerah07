import { createAdminClient } from "@/lib/supabase/admin";
import { getActivePeriodId } from "@/lib/settings";

export interface StudentRow {
  applicationId: string;
  status: string;
  studentId: string;
  name: string;
  nisn: string;
  class: string;
  docCount: number;
  docRequired: number;
  updatedAt: string | null;
}

export async function getActivePeriod(): Promise<{
  id: string;
  year: string;
} | null> {
  const id = await getActivePeriodId();
  if (!id) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("periods")
    .select("id, year")
    .eq("id", id)
    .single();
  return data;
}

export async function getDashboardStats(): Promise<{
  total: number;
  submitted: number;
  draft: number;
  notStarted: number;
  needsRevision: number;
}> {
  const period = await getActivePeriod();
  if (!period) return { total: 0, submitted: 0, draft: 0, notStarted: 0, needsRevision: 0 };

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("applications")
    .select("status")
    .eq("period_id", period.id);

  const rows = data ?? [];
  return {
    total: rows.length,
    submitted: rows.filter((r) => r.status === "submitted" || r.status === "verified").length,
    draft: rows.filter((r) => r.status === "draft").length,
    notStarted: rows.filter((r) => r.status === "not_started").length,
    needsRevision: rows.filter((r) => r.status === "needs_revision").length,
  };
}

export async function getStudentRows(): Promise<StudentRow[]> {
  const period = await getActivePeriod();
  if (!period) return [];

  const supabase = createAdminClient();

  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, updated_at, student:students(id, name, nisn, class)")
    .eq("period_id", period.id);

  const appIds = (apps ?? []).map((a: any) => a.id);
  let docMap: Record<string, number> = {};
  if (appIds.length) {
    const { data: docs } = await supabase
      .from("document_uploads")
      .select("application_id")
      .in("application_id", appIds);
    for (const d of docs ?? []) {
      docMap[d.application_id] = (docMap[d.application_id] ?? 0) + 1;
    }
  }

  const { data: reqTypes } = await supabase
    .from("document_types")
    .select("id")
    .eq("is_active", true)
    .eq("is_required", true);
  const reqCount = reqTypes?.length ?? 0;

  return (apps ?? []).map((a: any) => ({
    applicationId: a.id,
    status: a.status,
    studentId: a.student?.id,
    name: a.student?.name ?? "—",
    nisn: a.student?.nisn ?? "—",
    class: a.student?.class ?? "—",
    docCount: docMap[a.id] ?? 0,
    docRequired: reqCount,
    updatedAt: a.updated_at,
  }));
}
