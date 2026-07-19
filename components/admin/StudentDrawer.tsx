"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, MessageSquare, X, FileText, FileImage, Clock, StickyNote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DrawerFormTab } from "@/components/admin/DrawerFormTab";
import { DrawerDocumentsTab } from "@/components/admin/DrawerDocumentsTab";
import { DrawerActivityTab } from "@/components/admin/DrawerActivityTab";
import { relativeTime } from "@/lib/utils";

export function StudentDrawer({
  applicationId,
  orderedIds,
  index,
  onClose,
  onNavigate,
  onChanged,
}: {
  applicationId: string | null;
  orderedIds: string[];
  index: number;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [revOpen, setRevOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [acting, setActing] = React.useState(false);

  React.useEffect(() => {
    if (!applicationId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/application/${applicationId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const student = detail?.student;
  const status = detail?.application?.status as import("@/types").ApplicationStatus;
  const docCount = detail?.documents?.length ?? 0;
  const docRequired = detail?.documentTypes?.filter((d: any) => d.is_required).length ?? 0;

  function goPrev() {
    if (index > 0) onNavigate(orderedIds[index - 1]);
  }
  function goNext() {
    if (index < orderedIds.length - 1) onNavigate(orderedIds[index + 1]);
  }

  async function doVerify() {
    if (!applicationId) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/application/${applicationId}/verify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Diverifikasi");
      onChanged();
      router.refresh();
    } catch {
      toast.error("Gagal verifikasi");
    } finally {
      setActing(false);
    }
  }

  async function doRevision() {
    if (!applicationId) return;
    setActing(true);
    try {
      const res = await fetch(
        `/api/admin/application/${applicationId}/revision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );
      if (!res.ok) {
        const j = await res.json();
        toast.error(j.error ?? "Gagal memberi revisi");
        return;
      }
      toast.success("Revisi dikirim");
      setRevOpen(false);
      setNotes("");
      onChanged();
      router.refresh();
    } catch {
      toast.error("Gagal memberi revisi");
    } finally {
      setActing(false);
    }
  }

  const TAB_ICONS: Record<string, React.ElementType> = {
    data: FileText,
    documents: FileImage,
    activity: Clock,
    notes: StickyNote,
  };

  return (
    <Sheet open={!!applicationId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-[70vw] p-0">
        {loading || !detail ? (
          <div className="space-y-4 p-6">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="h-48 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="border-b px-6 py-4 shrink-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <SheetTitle className="text-lg font-bold text-gray-900">{student?.name}</SheetTitle>
                  <SheetDescription className="mt-0.5">
                    <span className="text-sm text-gray-500">
                      Kelas {student?.class} · NISN {student?.nisn}
                    </span>
                    <span className="mx-2 text-gray-300">·</span>
                    <StatusBadge status={status} />
                  </SheetDescription>
                  <p className="mt-1 text-xs text-gray-400">
                    {docCount}/{docRequired} dokumen · Update: {relativeTime(detail.application?.updated_at)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <Tabs defaultValue="data">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="data" className="gap-1.5 text-xs">
                    <FileText className="h-3.5 w-3.5" /> Data
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-1.5 text-xs">
                    <FileImage className="h-3.5 w-3.5" /> Dokumen
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5" /> Riwayat
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-1.5 text-xs">
                    <StickyNote className="h-3.5 w-3.5" /> Catatan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="pt-4">
                  <DrawerFormTab
                    studentData={detail.studentData}
                    guardianData={detail.guardianData}
                    emergencyContact={detail.emergencyContact}
                  />
                </TabsContent>

                <TabsContent value="documents" className="pt-4">
                  <DrawerDocumentsTab
                    documents={detail.documents}
                    documentTypes={detail.documentTypes}
                  />
                </TabsContent>

                <TabsContent value="activity" className="pt-4">
                  <DrawerActivityTab activities={detail.activities} />
                </TabsContent>

                <TabsContent value="notes" className="pt-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Catatan Revisi</h3>
                    {detail.application?.revision_notes ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {detail.application.revision_notes}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Belum ada catatan revisi.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t bg-white px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={index <= 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400"
                  >
                    Tutup
                  </Button>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {index + 1} / {orderedIds.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={index >= orderedIds.length - 1}
                  className="gap-1"
                >
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              {status === "submitted" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => setRevOpen(true)}
                    disabled={acting}
                  >
                    <MessageSquare className="h-4 w-4" /> Beri Revisi
                  </Button>
                  <Button
                    className="flex-1 gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm"
                    onClick={doVerify}
                    disabled={acting}
                  >
                    <Check className="h-4 w-4" /> Verifikasi
                  </Button>
                </div>
              )}
              {status === "needs_revision" && (
                <p className="text-center text-xs font-medium text-amber-600">
                  Menunggu perbaikan dari orang tua
                </p>
              )}
              {status === "verified" && (
                <p className="text-center text-xs font-medium text-green-600">
                  Terverifikasi ✓
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>

      <Dialog open={revOpen} onOpenChange={setRevOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catatan Revisi</DialogTitle>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jelaskan bagian yang perlu diperbaiki..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevOpen(false)}>
              Batal
            </Button>
            <Button onClick={doRevision} disabled={acting || !notes.trim()}>
              Kirim Revisi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
