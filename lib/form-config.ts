export type FieldType = "text" | "date" | "select" | "radio" | "checkbox" | "checkboxes" | "tel";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "text";
  full?: boolean;
}

export const STUDENT_FIELDS: FieldConfig[] = [
  { key: "nik", label: "NIK", type: "text", placeholder: "16 digit NIK", inputMode: "numeric" },
  { key: "no_kk", label: "No. KK", type: "text", placeholder: "16 digit No. KK", inputMode: "numeric" },
  { key: "name", label: "Nama", type: "text", full: true },
  {
    key: "gender", label: "Jenis Kelamin", type: "radio",
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
  { key: "sub_district", label: "Kelurahan/Desa", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text", inputMode: "numeric" },
  {
    key: "class", label: "Kelas", type: "radio",
    options: [
      { value: "1", label: "1" }, { value: "2", label: "2" },
      { value: "3", label: "3" }, { value: "4", label: "4" },
      { value: "5", label: "5" }, { value: "6", label: "6" },
      { value: "7", label: "7" }, { value: "8", label: "8" },
      { value: "9", label: "9" }, { value: "10", label: "10" },
      { value: "11", label: "11" }, { value: "12", label: "12" },
    ],
  },
  { key: "nisn", label: "NISN", type: "text", placeholder: "10 digit NISN", inputMode: "numeric" },
  { key: "npwp", label: "NPWP", type: "text", inputMode: "numeric" },
  { key: "identity_expiry", label: "Masa Berlaku Identitas", type: "date" },
  { key: "identity_permanent", label: "Seumur Hidup", type: "checkbox" },
  { key: "phone_mobile", label: "No. HP", type: "tel", inputMode: "tel", placeholder: "08xxxxxxxxxx" },
  { key: "phone_home", label: "No. Telepon", type: "tel", inputMode: "tel" },
  {
    key: "mail_pickup", label: "Alamat Surat", type: "radio",
    options: [
      { value: "self", label: "Diambil Sendiri" },
      { value: "delivery", label: "Dikirim" },
    ],
  },
  {
    key: "address_type", label: "Tipe Alamat", type: "radio",
    options: [
      { value: "rumah", label: "Alamat Rumah" },
      { value: "kantor", label: "Alamat Kantor" },
      { value: "npwp", label: "Alamat Sesuai NPWP" },
      { value: "rusun", label: "Alamat Rusun" },
      { value: "kost", label: "Alamat Kost" },
      { value: "panti", label: "Alamat Panti" },
      { value: "kk", label: "Alamat Sesuai KK" },
    ],
  },
  {
    key: "residence_status", label: "Status Tempat Tinggal", type: "radio",
    options: [
      { value: "bukan_pribadi", label: "Bukan Milik Pribadi" },
      { value: "pribadi", label: "Milik Pribadi" },
    ],
  },
  {
    key: "religion", label: "Agama", type: "radio",
    options: [
      { value: "hindu", label: "Hindu" },
      { value: "protestan", label: "Protestan" },
      { value: "katolik", label: "Katolik" },
      { value: "budha", label: "Budha" },
      { value: "islam", label: "Islam" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    key: "education", label: "Pendidikan", type: "radio",
    options: [
      { value: "SD", label: "SD" }, { value: "SMP", label: "SMP" },
      { value: "SMA", label: "SMA" }, { value: "SMK", label: "SMK" },
      { value: "MI", label: "MI" }, { value: "MTS", label: "MTS" },
      { value: "MA", label: "MA" }, { value: "PKBM_A", label: "PKBM A" },
      { value: "PKBM_B", label: "PKBM B" }, { value: "PKBM_C", label: "PKBM C" },
    ],
  },
  {
    key: "disability", label: "Disabilitas (Untuk SLB)", type: "checkboxes", full: true,
    options: [
      { value: "tuna_rungu", label: "Tuna Rungu (Tuli)" },
      { value: "tuna_netra", label: "Tuna Netra (Buta)" },
      { value: "tuna_wicara", label: "Tuna Wicara (Bisu)" },
      { value: "tuna_daksa", label: "Tuna Daksa (Cacat Fisik)" },
      { value: "tuna_grahita", label: "Tuna Grahita (Keterbelakangan Mental)" },
      { value: "tuna_laras", label: "Tuna Laras (Cacat Pengendalian Diri)" },
      { value: "tuna_ganda", label: "Tuna Ganda (Cacat Kombinasi)" },
    ],
  },
];

export const GUARDIAN_FIELDS: FieldConfig[] = [
  { key: "name", label: "Nama Wali", type: "text", full: true },
  { key: "nik", label: "No. KTP/NIK", type: "text", inputMode: "numeric" },
  { key: "ktp_expiry", label: "Masa Berlaku KTP", type: "date" },
  { key: "ktp_permanent", label: "Seumur Hidup", type: "checkbox" },
  { key: "npwp", label: "NPWP", type: "text", inputMode: "numeric" },
  { key: "no_kk", label: "Kartu Keluarga", type: "text", inputMode: "numeric" },
  { key: "birth_place", label: "Tempat Lahir", type: "text" },
  { key: "birth_date", label: "Tanggal Lahir", type: "date" },
  {
    key: "gender", label: "Jenis Kelamin", type: "radio",
    options: [
      { value: "L", label: "Laki-laki" },
      { value: "P", label: "Perempuan" },
    ],
  },
  {
    key: "religion", label: "Agama", type: "radio",
    options: [
      { value: "hindu", label: "Hindu" },
      { value: "protestan", label: "Protestan" },
      { value: "katolik", label: "Katolik" },
      { value: "budha", label: "Budha" },
      { value: "islam", label: "Islam" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
  {
    key: "occupation", label: "Pekerjaan", type: "radio",
    options: [
      { value: "pelajar", label: "Pelajar/Mahasiswa" },
      { value: "irt", label: "Ibu Rumah Tangga" },
      { value: "swasta", label: "Pegawai Swasta" },
      { value: "wiraswasta", label: "Wiraswasta" },
      { value: "tni_polri", label: "TNI/Polri" },
      { value: "pensiunan", label: "Pensiunan" },
      { value: "pns", label: "Pegawai Negeri" },
      { value: "lainnya", label: "Lain-Lain" },
    ],
  },
  { key: "mother_name", label: "Nama Ibu Kandung Wali", type: "text", full: true },
  {
    key: "marital_status", label: "Status Pernikahan", type: "radio",
    options: [
      { value: "lajang", label: "Lajang" },
      { value: "menikah", label: "Menikah" },
      { value: "janda_duda", label: "Janda/Duda" },
    ],
  },
  {
    key: "last_education", label: "Pendidikan Terakhir", type: "radio",
    options: [
      { value: "SD", label: "SD" }, { value: "SMP", label: "SMP" },
      { value: "SMA", label: "SMA" }, { value: "D1", label: "D1" },
      { value: "D2", label: "D2" }, { value: "D3", label: "D3" },
      { value: "S1", label: "S1" }, { value: "S2", label: "S2" },
      { value: "S3", label: "S3" },
    ],
  },
  {
    key: "employment_status", label: "Jabatan/Golongan", type: "radio",
    options: [
      { value: "tetap", label: "Tetap" },
      { value: "honorer", label: "Honorer" },
      { value: "kontrak", label: "Kontrak" },
      { value: "tidak_kerja", label: "Tidak Kerja" },
    ],
  },
  { key: "address", label: "Alamat", type: "text", full: true },
  { key: "rt", label: "RT", type: "text" },
  { key: "rw", label: "RW", type: "text" },
  { key: "province", label: "Provinsi", type: "text" },
  { key: "city", label: "Kota/Kabupaten", type: "text" },
  { key: "district", label: "Kecamatan", type: "text" },
  { key: "sub_district", label: "Kelurahan/Desa", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text", inputMode: "numeric" },
  {
    key: "residence_status", label: "Status Tempat Tinggal", type: "radio",
    options: [
      { value: "bukan_pribadi", label: "Bukan Milik Pribadi" },
      { value: "pribadi", label: "Milik Pribadi" },
    ],
  },
  { key: "phone_mobile", label: "No. HP", type: "tel", inputMode: "tel" },
  { key: "phone_home", label: "No. Telepon", type: "tel", inputMode: "tel" },
  {
    key: "address_type", label: "Tipe Alamat", type: "radio",
    options: [
      { value: "rumah", label: "Alamat Rumah" },
      { value: "kost", label: "Alamat Kost" },
    ],
  },
];

export const EMERGENCY_FIELDS: FieldConfig[] = [
  { key: "name", label: "Nama yang Dihubungi (Selain Wali)", type: "text", full: true },
  { key: "id_number", label: "No. Identitas", type: "text" },
  {
    key: "relationship", label: "Hubungan", type: "radio",
    options: [
      { value: "ortu", label: "Orangtua Kandung/Tiri/Angkat" },
      { value: "saudara", label: "Saudara Kandung/Tiri/Angkat" },
      { value: "suami_istri", label: "Suami/Istri" },
      { value: "kakek_nenek", label: "Kakek/Nenek" },
      { value: "ipar", label: "Ipar dari Istri/Suami" },
      { value: "anak", label: "Anak Kandung/Tiri/Angkat" },
      { value: "mertua", label: "Mertua" },
    ],
  },
  { key: "address", label: "Alamat", type: "text", full: true },
  { key: "rt", label: "RT", type: "text" },
  { key: "rw", label: "RW", type: "text" },
  { key: "province", label: "Provinsi", type: "text" },
  { key: "city", label: "Kota/Kabupaten", type: "text" },
  { key: "district", label: "Kecamatan", type: "text" },
  { key: "sub_district", label: "Kelurahan/Desa", type: "text" },
  { key: "postal_code", label: "Kode Pos", type: "text", inputMode: "numeric" },
  { key: "phone", label: "No. Telepon", type: "tel", inputMode: "tel" },
];
