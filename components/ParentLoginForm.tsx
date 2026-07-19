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
      className="animate-slide-up w-full space-y-5"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="nisn"
          className="block text-sm font-bold text-white/90 tracking-wide"
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
          className="h-12 w-full rounded-xl border border-white/25 bg-white/15 px-4 text-[15px] font-semibold text-white placeholder-white/50 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/25"
        />
        {error && (
          <p className="animate-fade-in text-sm font-bold text-red-300">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-white to-white font-bold text-red-700 shadow-lg shadow-black/25 transition-all duration-200 hover:from-white/90 hover:to-white/90 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative text-[15px]">
          {loading ? "Memproses..." : "Masuk"}
        </span>
      </button>

      <div className="space-y-1.5 text-center text-[13px] text-white/50">
        <p className="font-semibold text-white/70">Lupa NISN anak Anda?</p>
        <p>
          {siteConfig.school.whatsappNumber ? (
            <a
              href={`https://wa.me/${siteConfig.school.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-yellow-300/90 hover:text-yellow-200 transition-colors"
            >
              Hubungi Admin Sekolah via WhatsApp
            </a>
          ) : (
            <span className="text-white/40 font-medium">Hubungi Admin Sekolah via WhatsApp</span>
          )}
        </p>
        <p className="font-medium">atau</p>
        <p>
          {siteConfig.links.nisnCheckUrl ? (
            <a
              href={siteConfig.links.nisnCheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-yellow-300/90 hover:text-yellow-200 transition-colors"
            >
              Cek NISN di sini
            </a>
          ) : (
            <span className="text-white/40 font-medium">Cek NISN di sini</span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto block text-[13px] font-semibold text-white/40 transition-colors hover:text-white/70"
      >
        &larr; Kembali
      </button>
    </form>
  );
}
