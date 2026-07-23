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
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("period_id", period.id);

  if (error) {
    console.error("getDashboardStats error:", error);
    return { total: 0, submitted: 0, draft: 0, notStarted: 0, needsRevision: 0 };
  }

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

  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("id, status, updated_at, student_id")
    .eq("period_id", period.id);

  if (appsError || !apps?.length) {
    if (appsError) console.error("getStudentRows apps error:", appsError);
    return [];
  }

  const studentIds = [...new Set(apps.map((a) => a.student_id))];
  const { data: students, error: studError } = await supabase
    .from("students")
    .select("id, name, nisn, class")
    .in("id", studentIds);

  if (studError) {
    console.error("getStudentRows students error:", studError);
    return [];
  }

  const studentMap = new Map((students ?? []).map((s) => [s.id, s]));

  const appIds = apps.map((a) => a.id);
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

  return apps.map((a) => {
    const s = studentMap.get(a.student_id);
    return {
      applicationId: a.id,
      status: a.status,
      studentId: a.student_id,
      name: s?.name ?? "—",
      nisn: s?.nisn ?? "—",
      class: s?.class ?? "—",
      docCount: docMap[a.id] ?? 0,
      docRequired: reqCount,
      updatedAt: a.updated_at,
    };
  });
}
