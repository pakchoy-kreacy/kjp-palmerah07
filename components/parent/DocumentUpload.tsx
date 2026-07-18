"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/lib/utils";

export function DocumentUpload({
  documentTypes,
  documents,
}: {
  documentTypes: any[];
  documents: any[];
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = React.useState<string | null>(null);

  async function handleFile(typeId: string, file: File) {
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
      toast.success("Dokumen diupload");
      qc.invalidateQueries({ queryKey: ["application"] });
    } catch {
      toast.error("Gagal upload");
    } finally {
      setUploading(null);
    }
  }

  if (documentTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada jenis dokumen yang dikonfigurasi.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {documentTypes.map((dt) => {
        const uploaded = documents.find(
          (d) => d.document_type_id === dt.id
        );
        const isUploading = uploading === dt.id;
        return (
          <div
            key={dt.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{dt.name}</span>
                <Badge variant={dt.is_required ? "destructive" : "secondary"}>
                  {dt.is_required ? "WAJIB" : "OPSIONAL"}
                </Badge>
              </div>
              {uploaded ? (
                <p className="truncate text-xs text-muted-foreground">
                  {uploaded.file_name} · {formatBytes(uploaded.file_size)} ·{" "}
                  {formatDate(uploaded.uploaded_at)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Belum diupload</p>
              )}
            </div>

            <div className="shrink-0">
              {uploaded ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(dt.id, f);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                    <Upload className="h-4 w-4" /> Pilih
                  </span>
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
