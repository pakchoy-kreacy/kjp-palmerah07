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

export interface FormSectionHandle {
  validateAndSave: () => Promise<boolean>;
}

const OPTIONAL: Record<string, Set<string>> = {
  student: new Set([
    "npwp",
    "identity_expiry",
    "identity_permanent",
    "phone_home",
    "address_type",
    "residence_status",
    "disability",
    "mail_pickup",
  ]),
  guardian: new Set([
    "ktp_expiry",
    "ktp_permanent",
    "npwp",
    "no_kk",
    "birth_date",
    "gender",
    "religion",
    "mother_name",
    "marital_status",
    "employment_status",
    "residence_status",
    "phone_home",
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

export const FormSection = React.forwardRef<FormSectionHandle, {
  title: string;
  section: "student" | "guardian" | "emergency";
  fields: FieldConfig[];
  enabledKeys: Set<string>;
  defaultValues?: Record<string, any>;
}>(({ title, section, fields, enabledKeys, defaultValues }, ref) => {
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

  const saveValues = React.useCallback(async (values: Record<string, unknown>, successMessage: string) => {
    try {
      const res = await fetch("/api/application", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data: values }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Gagal menyimpan");
      }
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
      return false;
    }
  }, [section]);

  React.useImperativeHandle(ref, () => ({
    validateAndSave: () =>
      new Promise((resolve) => {
        void handleSubmit(async (values) => {
          resolve(await saveValues(values as Record<string, unknown>, "Data berhasil disimpan"));
        }, () => resolve(false))();
      }),
  }), [handleSubmit, saveValues]);

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
    await saveValues(getValues() as Record<string, unknown>, "Draft tersimpan");
  };

  const selectedValues = React.useCallback((val: string | undefined) => {
    return new Set((val ?? "").split(",").filter(Boolean));
  }, []);

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button type="button" size="sm" onClick={onManualSave} className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
          Simpan Draft
        </Button>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {enabled.map((f, i) => {
          const fieldError = (errors as any)[f.key]?.message as string | undefined;
          return (
            <div
              key={f.key}
              className={cn(
                "space-y-1 rounded-lg p-1.5 -mx-1.5",
                f.full && "col-span-2",
                Math.floor(i / 2) % 2 !== 0 && !f.full && "bg-gray-100",
                f.full && i % 2 !== 0 && "bg-gray-100"
              )}
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
                      className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1"
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
});

FormSection.displayName = "FormSection";
