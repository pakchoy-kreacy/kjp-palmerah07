"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTION_LABEL: Record<string, string> = {
  student: "Data Pribadi Siswa",
  guardian: "Data Wali",
  emergency: "Kontak Darurat",
};

export function FormFieldsSettings() {
  const [fields, setFields] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  const groups = ["student", "guardian", "emergency"];

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <Card key={g}>
          <CardHeader>
            <CardTitle className="text-base">
              {SECTION_LABEL[g]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields
              .filter((f) => f.section === g)
              .map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border-b py-2 text-sm"
                >
                  <span>{f.label}</span>
                  <Switch
                    checked={f.is_enabled}
                    onCheckedChange={(v: boolean) => toggle(f.id, v)}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
