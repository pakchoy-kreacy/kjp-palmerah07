"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

export function ParentLoginForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [nisn, setNisn] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNisnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setNisn(val);
    if (error) setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nisn.trim()) {
      setError("Masukkan NISN siswa.");
      return;
    }
    if (nisn.length !== 10) {
      setError("NISN harus 10 digit angka.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn: nisn.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "NISN tidak ditemukan.");
        return;
      }
      toast.success("Berhasil masuk");
      router.push("/form");
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
      <div className="space-y-1.5">
        <label
          htmlFor="nisn"
          className="block text-sm font-medium text-white/80"
        >
          NISN
        </label>
        <input
          id="nisn"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Masukkan NISN Siswa"
          value={nisn}
          onChange={handleNisnChange}
          maxLength={10}
          className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
        />
        {error && (
          <p className="animate-fade-in text-sm font-medium text-red-300">
            {error}
          </p>
        )}
      </div>

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

      <div className="space-y-1 text-center text-xs text-white/40">
        <p>Lupa NISN anak Anda?</p>
        <p>
          {siteConfig.school.whatsappNumber ? (
            <a
              href={`https://wa.me/${siteConfig.school.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-yellow-300/80 hover:text-yellow-200 transition-colors"
            >
              Hubungi Admin Sekolah melalui WhatsApp
            </a>
          ) : (
            <span className="text-white/30">Hubungi Admin Sekolah melalui WhatsApp</span>
          )}
        </p>
        <p>atau</p>
        <p>
          {siteConfig.links.nisnCheckUrl ? (
            <a
              href={siteConfig.links.nisnCheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-yellow-300/80 hover:text-yellow-200 transition-colors"
            >
              Cek NISN di sini
            </a>
          ) : (
            <span className="text-white/30">Cek NISN di sini</span>
          )}
        </p>
      </div>

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
