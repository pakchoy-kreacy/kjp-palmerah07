"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, XCircle, FileText, ImageIcon } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DocType {
  id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  sort_order: number;
}

interface DocUpload {
  id: string;
  document_type_id: string;
  file_name: string;
  file_size: number | null;
  uploaded_at: string;
}

export function DocumentUpload({
  documentTypes,
  documents,
}: {
  documentTypes: DocType[];
  documents: DocUpload[];
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<string | null>(null);

  const uploadedMap = React.useMemo(() => {
    const map = new Map<string, DocUpload>();
    for (const d of documents) map.set(d.document_type_id, d);
    return map;
  }, [documents]);

  async function handleFile(typeId: string, file: File) {
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(typeId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentTypeId", typeId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal upload");
        return;
      }
      toast.success("Dokumen berhasil diupload");
      qc.invalidateQueries({ queryKey: ["application"] });
    } catch {
      toast.error("Gagal upload");
    } finally {
      setUploading(null);
      setDragOver(null);
    }
  }

  if (documentTypes.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Belum ada jenis dokumen yang dikonfigurasi oleh sekolah.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {documentTypes.map((dt) => {
        const uploaded = uploadedMap.get(dt.id);
        const isUploading = uploading === dt.id;

        return (
          <div
            key={dt.id}
            className={cn(
              "group relative rounded-xl border-2 transition-all duration-200",
              uploaded
                ? "border-green-200 bg-green-50/50"
                : isUploading
                ? "border-red-300 bg-red-50/50"
                : dragOver === dt.id
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(dt.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(dt.id, f);
            }}
          >
            <div className="flex items-center gap-3 p-3">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                uploaded ? "bg-green-100" : "bg-gray-100"
              )}>
                {uploaded ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{dt.name}</span>
                  {dt.is_required && (
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">WAJIB</span>
                  )}
                  {!dt.is_required && (
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">OPSIONAL</span>
                  )}
                </div>
                {uploaded ? (
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {uploaded.file_name} · {formatBytes(uploaded.file_size)}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {dt.description ?? "Klik atau tarik file untuk upload"}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                 {uploaded ? (
                   <>
                     <input
                       id={`replace-${dt.id}`}
                       type="file"
                       accept="application/pdf"
                       className="hidden"
                       onChange={(e) => {
                         const f = e.target.files?.[0];
                         if (f) handleFile(dt.id, f);
                         e.target.value = "";
                       }}
                     />
                     <label
                       htmlFor={`replace-${dt.id}`}
                       className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                     >
                       <Upload className="h-3.5 w-3.5" />
                       Ganti
                     </label>
                   </>
                ) : isUploading ? (
                  <span className="text-xs font-medium text-red-500">Uploading...</span>
                ) : (
                  <>
                     <input
                       id={`upload-${dt.id}`}
                      type="file"
                      accept="application/pdf"
                      capture={false}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(dt.id, f);
                        e.target.value = "";
                      }}
                    />
                     <label htmlFor={`upload-${dt.id}`} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0">
                       <Upload className="h-3.5 w-3.5" />
                       Pilih
                     </label>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
