"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<{
    total: number;
    valid: number;
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
      setResult(`✅ ${json.added} data ditambahkan, ${json.updated} data diperbarui`);
      setPreview(null);
      toast.success("Import selesai");
    } catch {
      toast.error("Gagal import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setFile(null); setPreview(null); setResult(null); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-green-600" /> Import Data Siswa
          </DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan atau memperbarui data siswa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
            <Download className="h-4 w-4" /> Download Template Excel
          </Button>

          <div
            className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
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
            <Upload className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm font-semibold text-gray-600">
              {file ? file.name : "Klik atau drag & drop file di sini"}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Format: XLSX, XLS, CSV</p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-bold text-blue-700">Petunjuk Pengisian</p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-blue-600/80">
              <li>• Kolom wajib: NISN, Nama Lengkap, Kelas</li>
              <li>• NISN harus unik (tidak boleh duplikat)</li>
              <li>• Data akan ditambahkan atau diperbarui berdasarkan NISN</li>
              <li>• Baris pertama harus berisi nama kolom (header)</li>
            </ul>
          </div>

          {file && !preview && !result && (
            <Button onClick={previewImport} disabled={loading} variant="secondary" className="w-full gap-2">
              {loading ? "Membaca..." : "Pra-tinjau Data"}
            </Button>
          )}

          {preview && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-gray-600">Total: {preview.total}</span>
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> {preview.valid} Valid
                </span>
                {preview.errors.length > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-red-600">
                    <AlertCircle className="h-4 w-4" /> {preview.errors.length} Error
                  </span>
                )}
              </div>
              {preview.errors.length > 0 && (
                <div className="max-h-24 space-y-0.5 overflow-y-auto rounded bg-red-50 p-2 text-[11px] text-red-700">
                  {preview.errors.map((e, i) => (
                    <p key={i}>Baris {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={loading || preview.valid === 0} className="flex-1 gap-2">
                  {loading ? "Mengimport..." : "Konfirmasi Import"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setPreview(null); setFile(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-semibold text-green-700">
              {result}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
