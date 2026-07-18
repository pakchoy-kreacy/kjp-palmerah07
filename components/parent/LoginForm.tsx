"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [nisn, setNisn] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nisn.trim()) {
      setError("Masukkan NISN Anda.");
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
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="space-y-1.5 text-left">
        <Label htmlFor="nisn">NISN</Label>
        <Input
          id="nisn"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Masukkan NISN siswa"
          value={nisn}
          onChange={(e) => setNisn(e.target.value)}
          className="h-12 text-lg"
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
      <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
        {loading ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}
