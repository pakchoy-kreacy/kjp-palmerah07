"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

const SECTION_LABEL: Record<string, string> = {
  student: "Data Pribadi Siswa",
  guardian: "Data Wali",
  emergency: "Kontak Darurat",
};

export function FormFieldsSettings() {
  const [fields, setFields] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newField, setNewField] = React.useState<{ label: string; key: string; section: string }>({ label: "", key: "", section: "student" });
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(() => {
    const supabase = createClient();
    supabase
      .from("form_field_settings")
      .select("*")
      .order("section")
      .then(({ data }) => {
        setFields(data ?? []);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => load(), [load]);

  async function toggle(id: string, val: boolean) {
    const supabase = createClient();
    setFields((f) => f.map((x) => (x.id === id ? { ...x, is_enabled: val } : x)));
    const { error } = await supabase
      .from("form_field_settings")
      .update({ is_enabled: val })
      .eq("id", id);
    if (error) toast.error(error.message);
  }

  async function addField() {
    if (!newField.label.trim() || !newField.key.trim()) {
      toast.error("Label dan Field Key harus diisi");
      return;
    }
    setAdding(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("form_field_settings")
      .insert({ label: newField.label.trim(), field_key: newField.key.trim(), section: newField.section });
    if (error) toast.error(error.message);
    else {
      toast.success("Field ditambahkan");
      setNewField({ label: "", key: "", section: newField.section });
      load();
    }
    setAdding(false);
  }

  async function removeField(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("form_field_settings")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Field dihapus");
      load();
    }
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  const groups = ["student", "guardian", "emergency"];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Field Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[140px]">
              <Input
                placeholder="Label (contoh: No. KK)"
                value={newField.label}
                onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Input
                placeholder="Field Key (contoh: no_kk)"
                value={newField.key}
                onChange={(e) => setNewField((f) => ({ ...f, key: e.target.value }))}
                className="text-sm font-mono"
              />
            </div>
            <select
              value={newField.section}
              onChange={(e) => setNewField((f) => ({ ...f, section: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            >
              {groups.map((g) => (
                <option key={g} value={g}>{SECTION_LABEL[g]}</option>
              ))}
            </select>
            <Button onClick={addField} disabled={adding} className="gap-1.5">
              <Plus className="h-4 w-4" /> {adding ? "Menambah..." : "Tambah"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {groups.map((g) => (
        <Card key={g}>
          <CardHeader>
            <CardTitle className="text-base">{SECTION_LABEL[g]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.filter((f) => f.section === g).length === 0 && (
              <p className="text-sm text-muted-foreground italic">Belum ada field</p>
            )}
            {fields
              .filter((f) => f.section === g)
              .map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border-b py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{f.label}</span>
                    <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">{f.field_key}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={f.is_enabled}
                      onCheckedChange={(v: boolean) => toggle(f.id, v)}
                    />
                    <button
                      onClick={() => removeField(f.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
