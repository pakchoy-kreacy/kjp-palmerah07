"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportSettings() {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  async function run() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal import");
        return;
      }
      setResult(`${json.added} ditambah, ${json.updated} diperbarui`);
      toast.success("Import selesai");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data Siswa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Kolom minimal: NISN, Nama, Kelas. Upsert berdasarkan NISN.
        </p>
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {result && (
          <p className="rounded-md bg-success/10 p-2 text-sm text-success">
            {result}
          </p>
        )}
        <Button onClick={run} disabled={!file || loading} className="gap-1.5">
          <Upload className="h-4 w-4" /> {loading ? "Mengimport..." : "Konfirmasi Import"}
        </Button>
      </CardContent>
    </Card>
  );
}
