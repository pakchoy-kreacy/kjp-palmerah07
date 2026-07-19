"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<{
    total: number;
    valid: number;
    added: number;
    updated: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFileSelect = (f: File | null) => {
    setFile(f);
    setPreview(null);
    setResult(null);
  };

  async function downloadTemplate() {
    try {
      const res = await fetch("/api/export/template");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-import-siswa.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template siap digunakan");
    } catch {
      toast.error("Gagal download template");
    }
  }

  async function previewImport() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("preview", "true");
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal membaca file");
        return;
      }
      setPreview({
        total: json.total ?? 0,
        valid: json.valid ?? 0,
        added: json.preview?.added ?? 0,
        updated: json.preview?.updated ?? 0,
        errors: json.errors ?? [],
      });
    } catch {
      toast.error("Gagal membaca file");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal import");
        return;
      }
      setResult(`${json.added} data ditambahkan, ${json.updated} data diperbarui`);
      setPreview(null);
      toast.success("Import berhasil");
      router.refresh();
    } catch {
      toast.error("Gagal import");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-5 w-5 text-green-600" /> Import Data Siswa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Button variant="outline" onClick={downloadTemplate} size="sm" className="w-full gap-2 text-xs justify-center">
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Download Template Excel
          </Button>

          <div
            className={`relative rounded-xl border-2 border-dashed transition-colors flex items-center justify-center ${
              dragOver ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
            style={{ minHeight: "130px" }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="text-center">
              <Upload className="mx-auto h-5 w-5 text-gray-300" />
              <p className="mt-1 text-sm font-semibold text-gray-600">
                {file ? file.name : "Klik atau drag & drop file"}
              </p>
              <p className="text-xs text-gray-400">Format: XLSX, XLS, CSV</p>
            </div>
          </div>

          {file && !preview && !result && (
            <Button onClick={previewImport} disabled={loading} variant="secondary" size="sm" className="w-full gap-2 text-xs">
              {loading ? "Membaca..." : "Pra-tinjau Data"}
            </Button>
          )}

          {preview && preview.errors.length === 0 && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" /> Import Siap Diproses
              </div>
              <div className="text-sm text-green-600 space-y-0.5">
                <p>{preview.added} Data Baru</p>
                <p>{preview.updated} Data Diperbarui</p>
              </div>
              <Button onClick={handleImport} disabled={loading || preview.valid === 0} size="sm" className="mt-2 gap-1.5 text-xs">
                {loading ? "Mengimport..." : "Konfirmasi Import"}
              </Button>
            </div>
          )}

          {preview && preview.errors.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-gray-600">Total: {preview.total}</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {preview.valid} Valid
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                  <AlertCircle className="h-3.5 w-3.5" /> {preview.errors.length} Error
                </span>
              </div>
              <div className="space-y-1">
                {preview.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-1.5 rounded-md bg-red-50 border border-red-100 px-3 py-2">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <div className="text-xs text-red-700">
                      <span className="font-semibold">Baris {e.row}</span> — {e.message}
                    </div>
                  </div>
                ))}
              </div>
              {preview.valid > 0 && (
                <Button onClick={handleImport} disabled={loading} size="sm" className="mt-2 gap-1.5 text-xs">
                  {loading ? "Mengimport..." : "Import data valid"}
                </Button>
              )}
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" /> {result}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
