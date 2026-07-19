"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminsSettings() {
  const [admins, setAdmins] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    const supabase = createClient();
    supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setAdmins(data ?? []);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => load(), [load]);

  async function add() {
    if (!form.name || !form.email || !form.password) {
      toast.error("Lengkapi nama, email, password");
      return;
    }
    const supabase = createClient();
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
      });
    if (authErr || !authData.user) {
      toast.error(authErr?.message ?? "Gagal buat user");
      return;
    }
    const { error } = await supabase.from("admins").insert({
      id: authData.user.id,
      name: form.name,
      email: form.email,
      role: form.role,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Admin ditambah");
      setForm({ name: "", email: "", password: "", role: "admin" });
      load();
    }
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("admins").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Dihapus");
      load();
    }
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-48 w-full rounded-xl" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Input
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={add}>Tambah Admin</Button>

        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">
                  {a.name} <Badge variant="secondary">{a.role}</Badge>
                </p>
                <p className="text-sm text-muted-foreground">{a.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
