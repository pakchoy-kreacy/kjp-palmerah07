"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FilePreviewModal({
  open,
  onOpenChange,
  url,
  fileName,
  mimeType,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string | null;
  fileName?: string;
  mimeType?: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{fileName ?? "Preview"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto">
          {url ? (
            mimeType?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={fileName ?? "preview"}
                className="mx-auto max-h-[70vh] object-contain"
              />
            ) : (
              <iframe
                src={url}
                title={fileName ?? "preview"}
                className="h-[70vh] w-full border-0"
              />
            )
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak dapat memuat preview.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
