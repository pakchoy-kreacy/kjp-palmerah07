import { createClient } from "@supabase/supabase-js";

// HANYA untuk server-side (API routes, Server Actions).
// Menggunakan SERVICE ROLE KEY — BYPASS RLS. Jangan import di client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
