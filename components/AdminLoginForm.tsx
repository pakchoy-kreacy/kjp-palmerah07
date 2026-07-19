"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AdminLoginForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Masukkan email.");
      return;
    }
    if (!password) {
      setError("Masukkan password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      toast.success("Login berhasil");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-up w-full max-w-sm space-y-5"
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="admin-email"
            className="block text-sm font-medium text-white/80"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="admin@sekolah.sch.id"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            required
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-white/80"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            required
            className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>

      {error && (
        <p className="animate-fade-in text-sm font-medium text-red-300">
          {error}
        </p>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-white/30 bg-white/10 text-red-600 focus:ring-red-500"
        />
        Ingat Saya
      </label>

      <button
        type="submit"
        disabled={loading}
        className="group relative h-12 w-full overflow-hidden rounded-xl bg-white font-semibold text-red-700 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative">
          {loading ? "Memproses..." : "Masuk"}
        </span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto block text-xs text-white/40 transition-colors hover:text-white/60"
      >
        &larr; Kembali
      </button>
    </form>
  );
}
