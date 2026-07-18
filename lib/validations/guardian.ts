import { z } from "zod";

const requiredString = z.string().min(1, "Wajib diisi");

export const guardianDataSchema = z.object({
  name: requiredString,
  nik: requiredString,
  ktp_expiry: z.string().optional(),
  ktp_permanent: z.boolean().optional(),
  npwp: z.string().optional(),
  no_kk: z.string().optional(),
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(["L", "P"]).optional(),
  religion: z.string().optional(),
  occupation: requiredString,
  mother_name: z.string().optional(),
  marital_status: z.enum(["lajang", "menikah", "janda_duda"]).optional(),
  last_education: requiredString,
  employment_status: z
    .enum(["tetap", "honorer", "kontrak", "tidak_kerja"])
    .optional(),
  address: requiredString,
  rt: requiredString,
  rw: requiredString,
  province: requiredString,
  city: requiredString,
  district: requiredString,
  sub_district: requiredString,
  postal_code: requiredString,
  residence_status: z.enum(["pribadi", "bukan_pribadi"]).optional(),
  phone_mobile: requiredString,
  phone_home: z.string().optional(),
  address_type: z.string().optional(),
});

export type GuardianDataInput = z.infer<typeof guardianDataSchema>;

export const guardianDataDraftSchema = guardianDataSchema.partial();
