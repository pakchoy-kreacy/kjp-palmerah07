"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Save, Image } from "lucide-react";

export function IdentitySettings() {
  const [form, setForm] = React.useState({
    appName: "Portal Pendataan KJP Plus",
    schoolName: "SDN Palmerah 07 Pagi",
    footer: "© 2025 SDN Palmerah 07 Pagi. Hak cipta dilindungi.",
    primaryColor: "#DC2626",
    secondaryColor: "#991B1B",
    faviconUrl: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("key, value");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r) => (map[r.key] = r.value));

      const { data: school } = await supabase
        .from("schools")
        .select("name, logo_url")
        .limit(1)
        .maybeSingle();

      setForm({
        appName: map.app_name?.text ?? "Portal Pendataan KJP Plus",
        schoolName: school?.name ?? "SDN Palmerah 07 Pagi",
        footer: map.app_footer?.text ?? "© 2025 SDN Palmerah 07 Pagi",
        primaryColor: map.primary_color?.value ?? "#DC2626",
        secondaryColor: map.secondary_color?.value ?? "#991B1B",
        faviconUrl: map.favicon_url?.text ?? "",
      });
      setLoading(false);
    })();
  }, [supabase]);

  async function save() {
    setSaving(true);
    const rows: { key: string; value: any }[] = [
      { key: "app_name", value: { text: form.appName } },
      { key: "app_footer", value: { text: form.footer } },
      { key: "primary_color", value: { text: form.primaryColor } },
      { key: "secondary_color", value: { text: form.secondaryColor } },
      { key: "favicon_url", value: { text: form.faviconUrl } },
    ];
    let ok = true;
    for (const r of rows) {
      const { error } = await supabase.from("app_settings").upsert(r as any, { onConflict: "key" });
      if (error) ok = false;
    }

    if (form.schoolName) {
      const { data: existing } = await supabase.from("schools").select("id").limit(1).maybeSingle();
      if (existing?.id) {
        const { error: schoolErr } = await supabase
          .from("schools")
          .update({ name: form.schoolName })
          .eq("id", existing.id);
        if (schoolErr) ok = false;
      }
    }

    if (ok) toast.success("Identitas aplikasi tersimpan");
    else toast.error("Gagal menyimpan beberapa data");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-purple-600" /> Identitas Aplikasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Data ini digunakan untuk branding aplikasi di seluruh portal.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Nama Aplikasi</Label>
            <Input
              value={form.appName}
              onChange={(e) => setForm({ ...form, appName: e.target.value })}
              placeholder="Portal Pendataan KJP Plus"
              className="border-gray-200 text-sm font-semibold"
            />
            <p className="text-[11px] text-gray-400">Tampil di judul browser, navbar, dan header</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Nama Sekolah</Label>
            <Input
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              placeholder="SDN Palmerah 07 Pagi"
              className="border-gray-200 text-sm font-semibold"
            />
            <p className="text-[11px] text-gray-400">Tampil di sidebar, navbar, dan landing page</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-gray-700">Favicon URL</Label>
          <div className="flex gap-2">
            <Input
              value={form.faviconUrl}
              onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
              placeholder="https://example.com/favicon.ico"
              className="border-gray-200 text-sm flex-1"
            />
            {form.faviconUrl && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                <img src={form.faviconUrl} alt="" className="h-6 w-6" onError={(e) => { (e.currentTarget).style.display = "none"; }} />
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400">URL lengkap menuju file favicon (ico/png). Jika kosong, gunakan default.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Warna Utama</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 shrink-0 rounded-lg border"
                style={{ backgroundColor: form.primaryColor }}
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                placeholder="#DC2626"
                className="border-gray-200 text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-400">Warna merah utama untuk tombol dan aksen</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Warna Sekunder</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 shrink-0 rounded-lg border"
                style={{ backgroundColor: form.secondaryColor }}
              />
              <Input
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                placeholder="#991B1B"
                className="border-gray-200 text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-400">Warna merah gelap untuk sidebar dan gradient</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-gray-700">Footer / Copyright</Label>
          <Textarea
            value={form.footer}
            onChange={(e) => setForm({ ...form, footer: e.target.value })}
            placeholder="© 2025 SDN Palmerah 07 Pagi"
            className="border-gray-200 text-sm"
            rows={2}
          />
          <p className="text-[11px] text-gray-400">Teks footer yang tampil di halaman login</p>
        </div>

        <div className="pt-2">
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Identitas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
