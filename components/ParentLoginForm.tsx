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
    if (!nisn.trim()) { setError("Masukkan NISN siswa."); return; }
    if (nisn.length !== 10) { setError("NISN harus 10 digit angka."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn: nisn.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "NISN tidak ditemukan."); return; }
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
    <form onSubmit={handleSubmit} className="w-full space-y-2.5">
      <div className="space-y-1">
        <label htmlFor="nisn" className="block text-xs font-bold text-white/80 tracking-wide">
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
          className="h-10 w-full rounded-xl border border-white/25 bg-white/18 px-3.5 text-sm font-semibold text-white placeholder-white/60 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/25 focus:ring-2 focus:ring-white/25"
        />
        {error && (
          <p className="animate-fade-in text-xs font-bold text-red-300">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-white to-white font-bold text-red-700 shadow-md shadow-black/25 transition-all duration-200 hover:from-white/90 hover:to-white/90 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative text-sm">{loading ? "Memproses..." : "Masuk"}</span>
      </button>

      <div className="space-y-1 text-center text-xs text-white/45">
        <p className="font-semibold text-white/65">Lupa NISN anak Anda?</p>
        <p>
          {siteConfig.school.whatsappNumber ? (
            <a href={`https://wa.me/${siteConfig.school.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
              className="font-bold text-yellow-300/85 hover:text-yellow-200 transition-colors">
              Hubungi Admin Sekolah via WhatsApp
            </a>
          ) : (
            <span className="font-semibold text-white/40">Hubungi Admin Sekolah via WhatsApp</span>
          )}
        </p>
        <p className="font-semibold">atau</p>
        <p>
          {siteConfig.links.nisnCheckUrl ? (
            <a href={siteConfig.links.nisnCheckUrl} target="_blank" rel="noopener noreferrer"
              className="font-bold text-yellow-300/85 hover:text-yellow-200 transition-colors">
              Cek NISN di sini
            </a>
          ) : (
            <span className="font-semibold text-white/40">Cek NISN di sini</span>
          )}
        </p>
      </div>

      <button type="button" onClick={onBack}
        className="mx-auto block text-xs font-bold text-white/35 transition-colors hover:text-white/60">
        &larr; Kembali
      </button>
    </form>
  );
}
