"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
      setResult(`${json.added} data ditambahkan, ${json.updated} data diperbarui`);
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-green-600" /> Import Data Siswa
            </DialogTitle>
            <button onClick={() => onOpenChange(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription>
            Unggah file Excel untuk menambahkan atau memperbarui data siswa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button variant="outline" onClick={downloadTemplate} size="sm" className="w-full gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Download Template Excel
          </Button>

          <div
            className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
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
            <Upload className="mx-auto h-6 w-6 text-gray-300" />
            <p className="mt-1.5 text-sm font-semibold text-gray-600">
              {file ? file.name : "Klik atau drag & drop file"}
            </p>
            <p className="text-xs text-gray-400">Format: XLSX, XLS, CSV</p>
          </div>

          {file && !preview && !result && (
            <Button onClick={previewImport} disabled={loading} variant="secondary" size="sm" className="w-full gap-2 text-xs">
              {loading ? "Membaca..." : "Pra-tinjau Data"}
            </Button>
          )}

          {preview && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-gray-600">Total: {preview.total}</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {preview.valid} Valid
                </span>
                {preview.errors.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                    <AlertCircle className="h-3.5 w-3.5" /> {preview.errors.length} Error
                  </span>
                )}
              </div>
              {preview.errors.length > 0 && (
                <div className="rounded-lg bg-red-50/50 border border-red-100 p-2 space-y-0.5">
                  <p className="text-[11px] font-semibold text-red-700 mb-1">Baris bermasalah:</p>
                  {preview.errors.map((e, i) => (
                    <p key={i} className="text-[11px] text-red-600">Baris {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleImport} disabled={loading || preview.valid === 0} size="sm" className="flex-1 gap-1.5 text-xs">
                  {loading ? "Mengimport..." : "Konfirmasi Import"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setPreview(null); setFile(null); }} className="gap-1 text-xs">
                  <X className="h-3.5 w-3.5" /> Batal
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm font-semibold text-green-700">
              <CheckCircle2 className="inline h-4 w-4 mr-1" /> {result}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
