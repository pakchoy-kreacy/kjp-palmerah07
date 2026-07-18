"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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

export function SchoolSettings() {
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    address: "",
    whatsapp: "",
    logo_url: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("schools")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (active && data) setForm(data as any);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name,
      address: form.address,
      whatsapp: form.whatsapp,
      logo_url: form.logo_url,
    };
    let res;
    if (form.id) {
      res = await supabase.from("schools").update(payload).eq("id", form.id);
    } else {
      res = await supabase.from("schools").insert(payload).select("id").single();
    }
    if (res.error) toast.error("Gagal menyimpan");
    else {
      toast.success("Tersimpan");
      if (!form.id && res.data) setForm((f) => ({ ...f, id: (res.data as any).id }));
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Memuat...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Sekolah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Logo URL</Label>
          <Input
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nama Sekolah</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Alamat</Label>
          <Textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>No. WhatsApp</Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}
