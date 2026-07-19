"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatusSettings() {
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "registration_status")
      .maybeSingle()
      .then(({ data }) => {
        setOpen((data?.value as any)?.value !== "CLOSED");
        setLoading(false);
      });
  }, []);

  async function toggle(val: boolean) {
    setOpen(val);
    const supabase = createClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "registration_status", value: { value: val ? "OPEN" : "CLOSED" } },
        { onConflict: "key" }
      );
    if (error) toast.error(error.message);
    else
      toast.success(val ? "Pendataan dibuka" : "Pendataan ditutup");
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-32 w-full rounded-xl" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Pendataan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{open ? "OPEN" : "CLOSED"}</p>
            <p className="text-sm text-muted-foreground">
              {open
                ? "Orang tua dapat mengisi formulir."
                : "Landing page menampilkan pesan penutupan."}
            </p>
          </div>
          <Switch checked={open} onCheckedChange={toggle} />
        </div>
      </CardContent>
    </Card>
  );
}
