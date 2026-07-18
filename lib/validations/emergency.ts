import { z } from "zod";

const requiredString = z.string().min(1, "Wajib diisi");

export const emergencyDataSchema = z.object({
  name: requiredString,
  id_number: z.string().optional(),
  relationship: z.string().optional(),
  address: z.string().optional(),
  rt: z.string().optional(),
  rw: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  sub_district: z.string().optional(),
  postal_code: z.string().optional(),
  phone: requiredString,
});

export type EmergencyDataInput = z.infer<typeof emergencyDataSchema>;

export const emergencyDataDraftSchema = emergencyDataSchema.partial();
