// Tipe data untuk seluruh aplikasi Portal Pendataan KJP Plus

export type ApplicationStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "needs_revision"
  | "verified";

export interface School {
  id: string;
  name: string;
  address: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

export interface Period {
  id: string;
  year: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  period_id: string;
  status: ApplicationStatus;
  revision_notes: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentData {
  id: string;
  application_id: string;
  nik: string | null;
  no_kk: string | null;
  name: string | null;
  gender: "L" | "P" | null;
  birth_place: string | null;
  birth_date: string | null;
  mother_name: string | null;
  address: string | null;
  rt: string | null;
  rw: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  sub_district: string | null;
  postal_code: string | null;
  class: string | null;
  nisn: string | null;
  npwp: string | null;
  identity_expiry: string | null;
  identity_permanent: boolean;
  phone_mobile: string | null;
  phone_home: string | null;
  mail_pickup: "self" | "delivery" | null;
  address_type: string | null;
  residence_status: "pribadi" | "bukan_pribadi" | null;
  religion: string | null;
  education: string | null;
  disability: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuardianData {
  id: string;
  application_id: string;
  name: string | null;
  nik: string | null;
  ktp_expiry: string | null;
  ktp_permanent: boolean;
  npwp: string | null;
  no_kk: string | null;
  birth_place: string | null;
  birth_date: string | null;
  gender: "L" | "P" | null;
  religion: string | null;
  occupation: string | null;
  mother_name: string | null;
  marital_status: "lajang" | "menikah" | "janda_duda" | null;
  last_education: string | null;
  employment_status: "tetap" | "honorer" | "kontrak" | "tidak_kerja" | null;
  address: string | null;
  rt: string | null;
  rw: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  sub_district: string | null;
  postal_code: string | null;
  residence_status: "pribadi" | "bukan_pribadi" | null;
  phone_mobile: string | null;
  phone_home: string | null;
  address_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  application_id: string;
  name: string | null;
  id_number: string | null;
  relationship: string | null;
  address: string | null;
  rt: string | null;
  rw: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  sub_district: string | null;
  postal_code: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpload {
  id: string;
  application_id: string;
  document_type_id: string;
  file_name: string;
  file_size: number | null;
  file_path: string;
  mime_type: string | null;
  uploaded_at: string;
}

export interface FormFieldSetting {
  id: string;
  field_key: string;
  label: string;
  section: "student" | "guardian" | "emergency";
  is_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

export type ActivityAction =
  | "draft_saved"
  | "document_uploaded"
  | "submitted"
  | "revision_given"
  | "verified";

export interface ActivityLog {
  id: string;
  application_id: string;
  actor_type: "parent" | "admin";
  actor_id: string | null;
  action: ActivityAction;
  description: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin";
  created_at: string;
}

// Bentuk payload form orang tua (flat object dari React Hook Form)
export interface StudentFormValues {
  nik?: string;
  no_kk?: string;
  name?: string;
  gender?: "L" | "P";
  birth_place?: string;
  birth_date?: string;
  mother_name?: string;
  address?: string;
  rt?: string;
  rw?: string;
  province?: string;
  city?: string;
  district?: string;
  sub_district?: string;
  postal_code?: string;
  class?: string;
  nisn?: string;
  npwp?: string;
  identity_expiry?: string;
  identity_permanent?: boolean;
  phone_mobile?: string;
  phone_home?: string;
  mail_pickup?: "self" | "delivery";
  address_type?: string;
  residence_status?: "pribadi" | "bukan_pribadi";
  religion?: string;
  education?: string;
  disability?: string;
}

export interface GuardianFormValues {
  name?: string;
  nik?: string;
  ktp_expiry?: string;
  ktp_permanent?: boolean;
  npwp?: string;
  no_kk?: string;
  birth_place?: string;
  birth_date?: string;
  gender?: "L" | "P";
  religion?: string;
  occupation?: string;
  mother_name?: string;
  marital_status?: "lajang" | "menikah" | "janda_duda";
  last_education?: string;
  employment_status?: "tetap" | "honorer" | "kontrak" | "tidak_kerja";
  address?: string;
  rt?: string;
  rw?: string;
  province?: string;
  city?: string;
  district?: string;
  sub_district?: string;
  postal_code?: string;
  residence_status?: "pribadi" | "bukan_pribadi";
  phone_mobile?: string;
  phone_home?: string;
  address_type?: string;
}

export interface EmergencyFormValues {
  name?: string;
  id_number?: string;
  relationship?: string;
  address?: string;
  rt?: string;
  rw?: string;
  province?: string;
  city?: string;
  district?: string;
  sub_district?: string;
  postal_code?: string;
  phone?: string;
}

// Gabungan data untuk ditampilkan di drawer admin
export interface ApplicationDetail {
  application: Application;
  student: Student;
  studentData: StudentData | null;
  guardianData: GuardianData | null;
  emergencyContact: EmergencyContact | null;
  documents: (DocumentUpload & { document_type: DocumentType | null })[];
  activities: ActivityLog[];
}
