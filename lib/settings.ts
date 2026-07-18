import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicSettings {
  landingTitle: string;
  landingSubtitle: string;
  announcementBanner: string;
  registrationStatus: "OPEN" | "CLOSED";
  schoolName: string | null;
  schoolLogo: string | null;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  const map: Record<string, any> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));

  let schoolLogo: string | null = null;
  let schoolName: string | null = null;
  const { data: school } = await supabase
    .from("schools")
    .select("name, logo_url")
    .limit(1)
    .maybeSingle();
  if (school) {
    schoolName = school.name ?? null;
    schoolLogo = school.logo_url ?? null;
  }

  return {
    landingTitle: map.landing_title?.text ?? "Pendataan KJP Plus",
    landingSubtitle:
      map.landing_subtitle?.text ?? "Isi formulir dan unggah dokumen secara online",
    announcementBanner: map.announcement_banner?.text ?? "",
    registrationStatus: map.registration_status?.value ?? "OPEN",
    schoolName,
    schoolLogo,
  };
}

export async function getActivePeriodId(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("periods")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
