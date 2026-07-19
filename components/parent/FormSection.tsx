"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldConfig } from "@/lib/form-config";
import { cn } from "@/lib/utils";

const OPTIONAL: Record<string, Set<string>> = {
  student: new Set([
    "npwp",
    "phone_home",
    "disability",
    "identity_expiry",
    "identity_permanent",
  ]),
  guardian: new Set([
    "npwp",
    "phone_home",
    "ktp_permanent",
    "ktp_expiry",
    "no_kk",
    "birth_place",
    "birth_date",
    "mother_name",
    "gender",
    "address_type",
  ]),
  emergency: new Set([
    "id_number",
    "relationship",
    "address",
    "rt",
    "rw",
    "province",
    "city",
    "district",
    "sub_district",
    "postal_code",
  ]),
};

function buildSchema(
  fields: FieldConfig[],
  enabled: Set<string>,
  section: "student" | "guardian" | "emergency"
) {
  const shape: Record<string, z.ZodTypeAny> = {};
  const optionalSet = OPTIONAL[section];
  for (const f of fields) {
    if (!enabled.has(f.key)) continue;
    if (f.type === "checkbox") {
      shape[f.key] = z.boolean().optional();
    } else if (f.type === "checkboxes") {
      shape[f.key] = z.string().optional();
    } else if (optionalSet?.has(f.key)) {
      shape[f.key] = z.string().optional();
    } else {
      shape[f.key] = z.string().min(1, "Wajib diisi");
    }
  }
  return z.object(shape);
}

export function FormSection({
  title,
  section,
  fields,
  enabledKeys,
  defaultValues,
}: {
  title: string;
  section: "student" | "guardian" | "emergency";
  fields: FieldConfig[];
  enabledKeys: Set<string>;
  defaultValues?: Record<string, any>;
}) {
  const enabled = fields.filter((f) => enabledKeys.has(f.key));
  const schema = React.useMemo(
    () => buildSchema(fields, enabledKeys, section),
    [fields, enabledKeys, section]
  );

  const sanitizedDefaults = React.useMemo(() => {
    const raw = defaultValues ?? {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = v === null ? "" : v;
    }
    return out;
  }, [defaultValues]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: sanitizedDefaults,
    mode: "onBlur",
  });

  const firstRender = React.useRef(true);
  React.useEffect(() => {
    const sub = watch((value) => {
      if (firstRender.current) return;
      const t = setTimeout(async () => {
        try {
          const res = await fetch("/api/application", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, data: getValues() }),
          });
          if (res.ok) toast.success("Tersimpan otomatis");
        } catch {
          toast.error("Gagal menyimpan otomatis");
        }
      }, 2000);
      return () => clearTimeout(t);
    });
    firstRender.current = false;
    return () => sub.unsubscribe();
  }, [watch, getValues, section]);

  const onManualSave = async () => {
    const res = await fetch("/api/application", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data: getValues() }),
    });
    if (res.ok) toast.success("Draft tersimpan");
    else toast.error("Gagal menyimpan");
  };

  const selectedValues = React.useCallback((val: string | undefined) => {
    return new Set((val ?? "").split(",").filter(Boolean));
  }, []);

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onManualSave}>
          Simpan Draft
        </Button>
      </div>

      <form className="grid grid-cols-2 gap-3">
        {enabled.map((f) => {
          const fieldError = (errors as any)[f.key]?.message as string | undefined;
          return (
            <div
              key={f.key}
              className={cn("space-y-1", f.full && "col-span-2")}
            >
              <Label htmlFor={f.key}>{f.label}</Label>

              {f.type === "select" ? (
                <Controller
                  control={control}
                  name={f.key}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options?.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : f.type === "radio" ? (
                <Controller
                  control={control}
                  name={f.key}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-x-4 gap-y-1 pt-1"
                    >
                      {f.options?.map((o) => (
                        <label
                          key={o.value}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <RadioGroupItem value={o.value} />
                          {o.label}
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              ) : f.type === "checkbox" ? (
                <Controller
                  control={control}
                  name={f.key}
                  render={({ field }) => (
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              ) : f.type === "checkboxes" ? (
                <Controller
                  control={control}
                  name={f.key}
                  render={({ field }) => {
                    const selected = selectedValues(field.value);
                    return (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                        {f.options?.map((o) => (
                          <label
                            key={o.value}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={selected.has(o.value)}
                              onCheckedChange={(checked) => {
                                const next = new Set(selected);
                                if (checked) next.add(o.value);
                                else next.delete(o.value);
                                field.onChange(Array.from(next).join(","));
                              }}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    );
                  }}
                />
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "date" ? "date" : "text"}
                  inputMode={f.inputMode}
                  placeholder={f.placeholder}
                  {...register(f.key)}
                />
              )}

              {fieldError && (
                <p className="text-xs font-medium text-destructive">
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </form>
    </section>
  );
}
