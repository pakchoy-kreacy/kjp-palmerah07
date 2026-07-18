"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, MessageSquare } from "lucide-react";
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

  return (
    <Sheet open={!!applicationId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] p-0">
        {loading || !detail ? (
          <div className="space-y-3 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-start justify-between pr-8">
                <div>
                  <SheetTitle>{student?.name}</SheetTitle>
                  <SheetDescription>
                    Kelas {student?.class} ·{" "}
                    <StatusBadge status={status} />
                  </SheetDescription>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {docCount}/{docRequired} dokumen · Update:{" "}
                    {relativeTime(detail.application?.updated_at)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={index <= 0}
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={index >= orderedIds.length - 1}
                >
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="form">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="documents">Dokumen</TabsTrigger>
                  <TabsTrigger value="activity">Aktivitas</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <DrawerFormTab
                    studentData={detail.studentData}
                    guardianData={detail.guardianData}
                    emergencyContact={detail.emergencyContact}
                  />
                </TabsContent>
                <TabsContent value="documents">
                  <DrawerDocumentsTab
                    documents={detail.documents}
                    documentTypes={detail.documentTypes}
                  />
                </TabsContent>
                <TabsContent value="activity">
                  <DrawerActivityTab activities={detail.activities} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="border-t p-4">
              {status === "submitted" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRevOpen(true)}
                    disabled={acting}
                  >
                    <MessageSquare className="h-4 w-4" /> Beri Revisi
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={doVerify}
                    disabled={acting}
                  >
                    <Check className="h-4 w-4" /> Verifikasi
                  </Button>
                </div>
              )}
              {status === "needs_revision" && (
                <p className="text-center text-sm text-warning">
                  Menunggu perbaikan dari orang tua
                </p>
              )}
              {status === "verified" && (
                <p className="text-center text-sm text-success">
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
