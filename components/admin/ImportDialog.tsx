"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
  const [result, setResult] = React.useState<string | null>(null);

  async function handleImport() {
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
      setResult(
        `${json.added} data ditambahkan, ${json.updated} data diperbarui`
      );
      toast.success("Import selesai");
      router.refresh();
    } catch {
      toast.error("Gagal import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setFile(null);
          setResult(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data Siswa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            File Excel minimal berisi kolom: NISN, Nama, Kelas. Data akan di-upsert
            berdasarkan NISN.
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Mengimport..." : "Konfirmasi Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
