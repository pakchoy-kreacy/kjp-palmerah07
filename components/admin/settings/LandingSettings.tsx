"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LandingSettings() {
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    banner: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.from("app_settings").select("key, value").then(({ data }) => {
      const map: Record<string, any> = {};
      (data ?? []).forEach((r) => (map[r.key] = r.value));
      setForm({
        title: map.landing_title?.text ?? "",
        subtitle: map.landing_subtitle?.text ?? "",
        banner: map.announcement_banner?.text ?? "",
      });
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const rows = [
      { key: "landing_title", value: { text: form.title } },
      { key: "landing_subtitle", value: { text: form.subtitle } },
      { key: "announcement_banner", value: { text: form.banner } },
    ];
    let ok = true;
    for (const r of rows) {
      const { error } = await supabase
        .from("app_settings")
        .upsert(r, { onConflict: "key" });
      if (error) ok = false;
    }
    if (!ok) toast.error("Gagal menyimpan");
    else toast.success("Tersimpan");
    setSaving(false);
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Landing Page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Judul</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sub Judul</Label>
          <Input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Banner Pengumuman (kosongkan untuk sembunyikan)</Label>
          <Textarea
            value={form.banner}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
          />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}
