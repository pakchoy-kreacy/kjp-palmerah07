export type FieldType = "text" | "date" | "select" | "radio" | "checkbox" | "tel";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "text";
  full?: boolean; // colspan 2
}

export const STUDENT_FIELDS: FieldConfig[] = [
  { key: "nik", label: "NIK", type: "text", placeholder: "16 digit NIK" },
  { key: "no_kk", label: "No. KK", type: "text" },
  { key: "name", label: "Nama Lengkap", type: "text", full: true },
  {
    key: "gender",
    label: "Jenis Kelamin",
    type: "radio",
    options: [
      { value: "L", label: "Laki-laki" },
      { value: "P", label: "Perempuan" },
    ],
  },
  { key: "birth_place", label: "Tempat Lahir", type: "text" },
  { key: "birth_date", label: "Tanggal Lahir", type: "date" },
  { key: "mother_name", label: "Nama Ibu Kandung", type: "text", full: true },
  { key: "address", label: "Alamat", type: "text", full: true },
  { key: "rt", label: "RT", type: "text" },
  { key: "rw", label: "RW", type: "text" },
  { key: "province", label: "Provinsi", type: "text" },
  { key: "city", label: "Kota/Kabupaten", type: "text" },
  { key: "district", label: "Kecamatan", type: "text" },
  { key: "sub_district", label: "Kelurahan", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text" },
  { key: "class", label: "Kelas", type: "text" },
  { key: "nisn", label: "NISN", type: "text" },
  { key: "npwp", label: "NPWP", type: "text", inputMode: "numeric" },
  {
    key: "phone_mobile",
    label: "No. HP",
    type: "tel",
    inputMode: "tel",
    placeholder: "08xxxx",
  },
  { key: "phone_home", label: "No. Telepon", type: "tel", inputMode: "tel" },
  {
    key: "religion",
    label: "Agama",
    type: "select",
    options: [
      { value: "islam", label: "Islam" },
      { value: "protestan", label: "Protestan" },
      { value: "katolik", label: "Katolik" },
      { value: "hindu", label: "Hindu" },
      { value: "budha", label: "Budha" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    key: "education",
    label: "Pendidikan",
    type: "select",
    options: [
      { value: "SD", label: "SD" },
      { value: "SMP", label: "SMP" },
      { value: "SMA", label: "SMA" },
      { value: "SMK", label: "SMK" },
      { value: "MI", label: "MI" },
      { value: "MTS", label: "MTS" },
      { value: "MA", label: "MA" },
      { value: "PKBM_A", label: "PKBM A" },
      { value: "PKBM_B", label: "PKBM B" },
      { value: "PKBM_C", label: "PKBM C" },
    ],
  },
  { key: "disability", label: "Disabilitas (khusus SLB)", type: "text", full: true },
  { key: "identity_permanent", label: "Identitas Berlaku Seumur Hidup", type: "checkbox" },
  { key: "identity_expiry", label: "Berlaku Hingga", type: "date" },
  {
    key: "mail_pickup",
    label: "Pengambilan Surat",
    type: "select",
    options: [
      { value: "self", label: "Ambil Sendiri" },
      { value: "delivery", label: "Antar" },
    ],
  },
  { key: "address_type", label: "Jenis Alamat", type: "text" },
  {
    key: "residence_status",
    label: "Status Tempat Tinggal",
    type: "select",
    options: [
      { value: "pribadi", label: "Pribadi" },
      { value: "bukan_pribadi", label: "Bukan Pribadi" },
    ],
  },
];

export const GUARDIAN_FIELDS: FieldConfig[] = [
  { key: "name", label: "Nama Wali", type: "text", full: true },
  { key: "nik", label: "No. KTP/NIK", type: "text" },
  { key: "no_kk", label: "No. KK", type: "text" },
  {
    key: "gender",
    label: "Jenis Kelamin",
    type: "radio",
    options: [
      { value: "L", label: "Laki-laki" },
      { value: "P", label: "Perempuan" },
    ],
  },
  { key: "birth_place", label: "Tempat Lahir", type: "text" },
  { key: "birth_date", label: "Tanggal Lahir", type: "date" },
  { key: "mother_name", label: "Nama Ibu Kandung", type: "text", full: true },
  {
    key: "religion",
    label: "Agama",
    type: "select",
    options: [
      { value: "islam", label: "Islam" },
      { value: "protestan", label: "Protestan" },
      { value: "katolik", label: "Katolik" },
      { value: "hindu", label: "Hindu" },
      { value: "budha", label: "Budha" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    key: "occupation",
    label: "Pekerjaan",
    type: "select",
    options: [
      { value: "pelajar", label: "Pelajar" },
      { value: "irt", label: "Ibu Rumah Tangga" },
      { value: "swasta", label: "Swasta" },
      { value: "wiraswasta", label: "Wiraswasta" },
      { value: "tni_polri", label: "TNI/Polri" },
      { value: "pensiunan", label: "Pensiunan" },
      { value: "pns", label: "PNS" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    key: "marital_status",
    label: "Status Pernikahan",
    type: "select",
    options: [
      { value: "lajang", label: "Lajang" },
      { value: "menikah", label: "Menikah" },
      { value: "janda_duda", label: "Janda/Duda" },
    ],
  },
  {
    key: "last_education",
    label: "Pendidikan Terakhir",
    type: "select",
    options: [
      { value: "SD", label: "SD" },
      { value: "SMP", label: "SMP" },
      { value: "SMA", label: "SMA" },
      { value: "D1", label: "D1" },
      { value: "D2", label: "D2" },
      { value: "D3", label: "D3" },
      { value: "S1", label: "S1" },
      { value: "S2", label: "S2" },
      { value: "S3", label: "S3" },
    ],
  },
  {
    key: "employment_status",
    label: "Status Pekerjaan",
    type: "select",
    options: [
      { value: "tetap", label: "Tetap" },
      { value: "honorer", label: "Honorer" },
      { value: "kontrak", label: "Kontrak" },
      { value: "tidak_kerja", label: "Tidak Bekerja" },
    ],
  },
  { key: "address", label: "Alamat", type: "text", full: true },
  { key: "rt", label: "RT", type: "text" },
  { key: "rw", label: "RW", type: "text" },
  { key: "province", label: "Provinsi", type: "text" },
  { key: "city", label: "Kota/Kabupaten", type: "text" },
  { key: "district", label: "Kecamatan", type: "text" },
  { key: "sub_district", label: "Kelurahan", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text" },
  {
    key: "residence_status",
    label: "Status Tempat Tinggal",
    type: "select",
    options: [
      { value: "pribadi", label: "Pribadi" },
      { value: "bukan_pribadi", label: "Bukan Pribadi" },
    ],
  },
  { key: "phone_mobile", label: "No. HP", type: "tel", inputMode: "tel" },
  { key: "phone_home", label: "No. Telepon", type: "tel", inputMode: "tel" },
  { key: "npwp", label: "NPWP", type: "text", inputMode: "numeric" },
  { key: "ktp_permanent", label: "KTP Berlaku Seumur Hidup", type: "checkbox" },
  { key: "ktp_expiry", label: "Berlaku Hingga", type: "date" },
  { key: "address_type", label: "Jenis Alamat", type: "text" },
];

export const EMERGENCY_FIELDS: FieldConfig[] = [
  { key: "name", label: "Nama yang Dihubungi", type: "text", full: true },
  { key: "id_number", label: "No. Identitas", type: "text" },
  {
    key: "relationship",
    label: "Hubungan",
    type: "select",
    options: [
      { value: "ortu", label: "Orang Tua" },
      { value: "saudara", label: "Saudara" },
      { value: "suami_istri", label: "Suami/Istri" },
      { value: "kakek_nenek", label: "Kakek/Nenek" },
      { value: "ipar", label: "Ipar" },
      { value: "anak", label: "Anak" },
      { value: "mertua", label: "Mertua" },
    ],
  },
  { key: "address", label: "Alamat", type: "text", full: true },
  { key: "rt", label: "RT", type: "text" },
  { key: "rw", label: "RW", type: "text" },
  { key: "province", label: "Provinsi", type: "text" },
  { key: "city", label: "Kota/Kabupaten", type: "text" },
  { key: "district", label: "Kecamatan", type: "text" },
  { key: "sub_district", label: "Kelurahan", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text" },
  { key: "phone", label: "No. Telepon", type: "tel", inputMode: "tel" },
];
