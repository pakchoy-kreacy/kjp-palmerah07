"use client";

import * as React from "react";
import { Eye, Download, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePreviewModal } from "@/components/shared/FilePreviewModal";
import { formatBytes, formatDate } from "@/lib/utils";

export function DrawerDocumentsTab({
  documents,
  documentTypes,
}: {
  documents: any[];
  documentTypes: any[];
}) {
  const [preview, setPreview] = React.useState<{
    url: string;
    fileName?: string;
    mimeType?: string;
  } | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  async function getSigned(uploadId: string) {
    setLoadingId(uploadId);
    try {
      const res = await fetch(`/api/admin/document/${uploadId}`);
      const json = await res.json();
      if (!res.ok) return null;
      return json as { url: string; fileName: string; mimeType: string };
    } finally {
      setLoadingId(null);
    }
  }

  async function handlePreview(uploadId: string) {
    const s = await getSigned(uploadId);
    if (s) setPreview(s);
  }

  async function handleDownload(uploadId: string) {
    const s = await getSigned(uploadId);
    if (s) window.open(s.url, "_blank");
  }

  if (documentTypes.length === 0) {
    return <p className="text-sm text-muted-foreground">Tidak ada jenis dokumen.</p>;
  }

  return (
    <div className="space-y-3">
      {documentTypes.map((dt: any) => {
        const up = documents.find(
          (d: any) => d.document_type_id === dt.id
        );
        return (
          <div
            key={dt.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dt.name}</span>
                <Badge variant={dt.is_required ? "destructive" : "secondary"}>
                  {dt.is_required ? "WAJIB" : "OPSIONAL"}
                </Badge>
              </div>
              {up ? (
                <p className="truncate text-xs text-muted-foreground">
                  {up.file_name} · {formatBytes(up.file_size)} ·{" "}
                  {formatDate(up.uploaded_at)}
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs text-warning">
                  <FileWarning className="h-3 w-3" /> Belum diupload
                </p>
              )}
            </div>
            {up && (
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePreview(up.id)}
                  disabled={loadingId === up.id}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(up.id)}
                  disabled={loadingId === up.id}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}

      <FilePreviewModal
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        url={preview?.url ?? null}
        fileName={preview?.fileName}
        mimeType={preview?.mimeType}
      />
    </div>
  );
}
