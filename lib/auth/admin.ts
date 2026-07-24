import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const authClient = createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from("admins")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) return null;
  return { user, admin };
}
