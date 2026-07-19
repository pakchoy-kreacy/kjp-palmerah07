import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  const headers = [
    "NISN",
    "Nama Lengkap",
    "Kelas",
    "Jenis Kelamin",
    "Tanggal Lahir",
    "Nama Ayah",
    "Nama Ibu",
    "Alamat",
    "No HP",
    "Status",
  ];

  const examples = [
    ["1234567890", "Budi Santoso", "6A", "L", "2013-05-12", "Slamet", "Siti Aminah", "Jl. Merdeka No. 1", "081234567890", "Aktif"],
    ["1234567891", "Siti Rahmawati", "6A", "P", "2013-08-22", "Ahmad", "Fatimah", "Jl. Sudirman No. 5", "081234567891", "Aktif"],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);

  ws["!cols"] = headers.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, "Template Import");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-import-siswa.xlsx"',
    },
  });
}
