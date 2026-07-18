"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PeriodSettings() {
  const [periods, setPeriods] = React.useState<any[]>([]);
  const [year, setYear] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    const supabase = createClient();
    supabase
      .from("periods")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => {
        setPeriods(data ?? []);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => load(), [load]);

  async function add() {
    if (!year.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("periods")
      .insert({ year: year.trim(), label: label.trim() || null });
    if (error) toast.error(error.message);
    else {
      toast.success("Periode ditambah");
      setYear("");
      setLabel("");
      load();
    }
  }

  async function setActive(id: string, val: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("periods")
      .update({ is_active: val })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Periode aktif diperbarui");
      load();
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Memuat...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Periode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label>Tahun</Label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Tahun Anggaran 2026"
            />
          </div>
          <Button onClick={add}>Tambah Periode</Button>
        </div>

        <div className="space-y-2">
          {periods.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">
                  {p.year}{" "}
                  {p.is_active && <Badge className="ml-1">AKTIF</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">{p.label}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                Jadikan Aktif
                <Switch
                  checked={p.is_active}
                  onCheckedChange={(v: boolean) => setActive(p.id, v)}
                />
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
