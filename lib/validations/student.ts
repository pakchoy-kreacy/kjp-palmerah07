import { z } from "zod";

const requiredString = z.string().min(1, "Wajib diisi");

export const studentDataSchema = z.object({
  name: requiredString,
  nik: requiredString,
  no_kk: requiredString,
  gender: z.enum(["L", "P"], { required_error: "Wajib dipilih" }),
  birth_place: requiredString,
  birth_date: requiredString,
  mother_name: requiredString,
  address: requiredString,
  rt: requiredString,
  rw: requiredString,
  province: requiredString,
  city: requiredString,
  district: requiredString,
  sub_district: requiredString,
  postal_code: requiredString,
  class: requiredString,
  nisn: requiredString,
  npwp: z.string().optional(),
  identity_expiry: z.string().optional(),
  identity_permanent: z.boolean().optional(),
  phone_mobile: requiredString,
  phone_home: z.string().optional(),
  mail_pickup: z.enum(["self", "delivery"]).optional(),
  address_type: z.string().optional(),
  residence_status: z.enum(["pribadi", "bukan_pribadi"]).optional(),
  religion: requiredString,
  education: requiredString,
  disability: z.string().optional(),
});

export type StudentDataInput = z.infer<typeof studentDataSchema>;

export const studentDataDraftSchema = studentDataSchema.partial();
