import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export type AdminAccess = {
  user: User;
  admin: { id: string; name: string; email: string; role: string };
};

export type AdminDenyReason =
  | "no_session"
  | "no_admin_row"
  | "service_role_missing"
  | "unknown_error";

export type AdminCheckResult = AdminAccess | { denied: AdminDenyReason; detail?: string };

export async function requireAdmin(): Promise<AdminCheckResult> {
  try {
    const authClient = createServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return { denied: "no_session" };

    try {
      const adminClient = createAdminClient();
      const { data: admin, error: adminErr } = await adminClient
        .from("admins")
        .select("id, name, email, role")
        .eq("id", user.id)
        .maybeSingle();

      if (adminErr) {
        console.error("admins query error:", adminErr);
        return {
          denied: adminErr.message.includes("service_role") || adminErr.message.includes("apikey")
            ? "service_role_missing"
            : "unknown_error",
          detail: adminErr.message,
        };
      }

      if (!admin) return { denied: "no_admin_row" };
      return { user, admin };
    } catch (adminErr: any) {
      console.error("admin client error:", adminErr);
      return { denied: "service_role_missing", detail: adminErr?.message };
    }
  } catch (error: any) {
    console.error("admin authorization error:", error);
    return { denied: "unknown_error", detail: error?.message };
  }
}

export function isAdminAccess(result: AdminCheckResult): result is AdminAccess {
  return !("denied" in result);
}
