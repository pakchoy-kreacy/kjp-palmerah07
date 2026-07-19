"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DocumentTypesSettings() {
  const [types, setTypes] = React.useState<any[]>([]);
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    const supabase = createClient();
    supabase
      .from("document_types")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setTypes(data ?? []);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => load(), [load]);

  async function add() {
    if (!name.trim()) return;
    const supabase = createClient();
    const max =
      types.reduce((m, t) => Math.max(m, t.sort_order), 0) ?? 0;
    const { error } = await supabase
      .from("document_types")
      .insert({ name: name.trim(), sort_order: max + 1 });
    if (error) toast.error(error.message);
    else {
      toast.success("Ditambah");
      setName("");
      load();
    }
  }

  async function update(id: string, patch: any) {
    const supabase = createClient();
    const { error } = await supabase
      .from("document_types")
      .update(patch)
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("document_types")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Dihapus");
      load();
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= types.length) return;
    const a = types[idx];
    const b = types[target];
    update(a.id, { sort_order: b.sort_order });
    update(b.id, { sort_order: a.sort_order });
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-48 w-full rounded-xl" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jenis Dokumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama dokumen baru"
          />
          <Button onClick={add}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>

        <div className="space-y-2">
          {types.map((t, i) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t.name}</p>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <label className="flex items-center gap-1">
                    Wajib
                    <Switch
                      checked={t.is_required}
                      onCheckedChange={(v: boolean) => update(t.id, { is_required: v })}
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    Aktif
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(v: boolean) => update(t.id, { is_active: v })}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(i, 1)}
                  disabled={i === types.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(t.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
