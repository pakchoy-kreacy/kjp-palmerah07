"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Save, Image, Phone, Link, Building } from "lucide-react";

export function SchoolSettings() {
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    address: "",
    whatsapp: "",
    logo_url: "",
    bg_url: "",
    nisn_check_url: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [bgPreview, setBgPreview] = React.useState<string | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("schools")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (active && data) {
        setForm(data as any);
        if (data.logo_url) setLogoPreview(data.logo_url);
        if ((data as any).bg_url) setBgPreview((data as any).bg_url);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [supabase]);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Maksimal 2 MB");
      return;
    }
    const ext = file.name.split(".").pop();
    if (!["png", "jpg", "jpeg"].includes(ext?.toLowerCase() ?? "")) {
      toast.error("Format: PNG, JPG, JPEG");
      return;
    }
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    try {
      const url = await uploadFile(file, "kjp-documents", `school/logo.${ext}`);
      setForm((f) => ({ ...f, logo_url: url }));
      toast.success("Logo berhasil diupload");
    } catch {
      toast.error("Gagal upload logo");
      setLogoPreview(null);
    }
    e.target.value = "";
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Maksimal 2 MB");
      return;
    }
    const preview = URL.createObjectURL(file);
    setBgPreview(preview);
    const ext = file.name.split(".").pop() ?? "jpg";
    try {
      const url = await uploadFile(file, "kjp-documents", `school/background.${ext}`);
      setForm((f) => ({ ...f, bg_url: url }));
      toast.success("Background berhasil diupload");
    } catch {
      toast.error("Gagal upload background");
      setBgPreview(null);
    }
    e.target.value = "";
  };

  async function save() {
    setSaving(true);
    const payload = {
      name: form.name,
      address: form.address,
      whatsapp: form.whatsapp,
      logo_url: form.logo_url,
      bg_url: form.bg_url,
      nisn_check_url: form.nisn_check_url,
    };
    let res;
    if (form.id) {
      res = await supabase.from("schools").update(payload).eq("id", form.id);
    } else {
      res = await supabase.from("schools").insert(payload).select("id").single();
    }
    if (res.error) toast.error("Gagal menyimpan");
    else {
      toast.success("Profil sekolah tersimpan");
      if (!form.id && res.data) setForm((f) => ({ ...f, id: (res.data as any).id }));
    }
    setSaving(false);
  }

  const updateField = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (key === "name" || key === "logo_url") {
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Sekolah</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola identitas sekolah yang tampil di portal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-4 w-4 text-red-600" /> Informasi Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Nama Sekolah</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="SDN Palmerah 07 Pagi"
                className="border-gray-200 text-sm font-semibold"
              />
              <p className="text-[11px] text-gray-400">Nama ini otomatis tampil di halaman login, navbar, dan footer</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Alamat Sekolah</Label>
              <Textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Jl. Contoh No. 123, Jakarta"
                className="border-gray-200 text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Phone className="h-3.5 w-3.5 text-green-600" /> Nomor WhatsApp Admin
              </Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="6281234567890"
                className="border-gray-200 text-sm font-mono"
              />
              <p className="text-[11px] text-gray-400">Gunakan format internasional tanpa + dan spasi. Contoh: 6281234567890. Nomor ini dipakai untuk tombol &quot;Hubungi Admin&quot; di halaman login orang tua.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Link className="h-3.5 w-3.5 text-blue-600" /> Link Cek NISN
              </Label>
              <Input
                value={form.nisn_check_url}
                onChange={(e) => updateField("nisn_check_url", e.target.value)}
                placeholder="https://referensi.data.kemdikbud.go.id/..."
                className="border-gray-200 text-sm"
              />
              <p className="text-[11px] text-gray-400">Jika dikosongkan, tombol &quot;Cek NISN&quot; tetap tampil tetapi nonaktif.</p>
            </div>

            <div className="pt-2">
              <Button onClick={save} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4 text-red-600" /> Logo Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-300">
                    ?
                  </div>
                )}
              </div>
              <div>
                <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                  <input type="file" accept=".png,.jpg,.jpeg" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <p className="mt-1 text-center text-[10px] text-gray-400">PNG / JPG. Maks 2 MB</p>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Logo otomatis digunakan pada splash screen, halaman login, navbar admin, dan favicon.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4 text-red-600" /> Background Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50" style={{ height: "80px" }}>
                {bgPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgPreview} alt="Background" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] text-gray-400">Belum ada background</span>
                )}
              </div>
              <div>
                <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Upload Background
                  <input type="file" accept=".png,.jpg,.jpeg" onChange={handleBgUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <p className="mt-1 text-center text-[10px] text-gray-400">PNG / JPG. Maks 2 MB</p>
              </div>
              <p className="text-[11px] text-gray-400">Background tampil dengan efek blur pada halaman login. Jika belum diupload, gunakan gradient default.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
