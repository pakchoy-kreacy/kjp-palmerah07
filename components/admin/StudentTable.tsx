"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Upload, Search, FileSpreadsheet, Users, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentDrawer } from "@/components/admin/StudentDrawer";
import { ImportDialog } from "@/components/admin/ImportDialog";
import type { StudentRow } from "@/lib/admin-data";
import { relativeTime } from "@/lib/utils";

const columnHelper = createColumnHelper<StudentRow>();

export function StudentTable({ initialRows }: { initialRows: StudentRow[] }) {
  const router = useRouter();
  const [data] = React.useState(initialRows);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);

  const classes = React.useMemo(
    () => Array.from(new Set(initialRows.map((r) => r.class))).sort(),
    [initialRows]
  );

  const columns = [
    columnHelper.accessor("name", {
      header: "Nama",
      cell: (c) => <span className="font-semibold text-gray-800">{c.getValue()}</span>,
    }),
    columnHelper.accessor("nisn", {
      header: "NISN",
      cell: (c) => <span className="font-mono text-sm text-gray-600">{c.getValue()}</span>,
    }),
    columnHelper.accessor("class", {
      header: "Kelas",
      cell: (c) => <span className="text-sm text-gray-600">{c.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (c) => <StatusBadge status={c.getValue() as any} />,
    }),
    columnHelper.accessor("docCount", {
      header: "Dokumen",
      enableSorting: false,
      cell: (c) => (
        <span className="text-sm text-gray-500">
          {c.getValue()}/{c.row.original.docRequired}
        </span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Update",
      cell: (c) => (
        <span className="text-sm text-gray-400">
          {relativeTime(c.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "aksi",
      header: "",
      cell: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(c.row.original.applicationId);
          }}
          className="text-xs font-semibold"
        >
          Detail
        </Button>
      ),
    }),
  ];

  const filtered = React.useMemo(() => {
    return data.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (classFilter !== "all" && r.class !== classFilter) return false;
      if (
        globalFilter &&
        !`${r.name} ${r.nisn}`.toLowerCase().includes(globalFilter.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, statusFilter, classFilter, globalFilter]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  async function handleExport() {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data-siswa-kjp.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export berhasil");
    } catch {
      toast.error("Gagal export");
    }
  }

  const orderedIds = filtered.map((r) => r.applicationId);
  const selectedIndex = selectedId ? orderedIds.indexOf(selectedId) : -1;

  // Empty state (no data at all)
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <Users className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-700">Belum ada data siswa</h3>
        <p className="mt-1 text-sm text-gray-400 max-w-sm text-center">
          Import data siswa menggunakan template Excel untuk memulai pendataan.
        </p>
        <div className="mt-6 flex gap-3">
          <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
          <Button onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Download Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2 sticky top-0 z-10 bg-gray-50/80 pb-2 backdrop-blur">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama / NISN..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="not_started">Belum Mengisi</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Menunggu</SelectItem>
            <SelectItem value="needs_revision">Perlu Revisi</SelectItem>
            <SelectItem value="verified">Lengkap</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[110px] h-9 text-xs">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" onClick={() => setImportOpen(true)} className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-gray-100 bg-gray-50/50">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={`text-xs font-bold uppercase tracking-wider text-gray-500 py-3 ${
                      h.column.getCanSort() ? "cursor-pointer select-none hover:text-gray-700" : ""
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-200" />
                    <p className="text-sm font-medium text-gray-400">Tidak ada data yang cocok</p>
                    <p className="text-xs text-gray-400">Coba ubah filter pencarian</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer border-gray-100 transition-colors hover:bg-gray-50"
                  onClick={() => setSelectedId(row.original.applicationId)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {table.getFilteredRowModel().rows.length} siswa
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold text-gray-600 min-w-[60px] text-center">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <StudentDrawer
        applicationId={selectedId}
        orderedIds={orderedIds}
        index={selectedIndex}
        onClose={() => setSelectedId(null)}
        onNavigate={(id) => setSelectedId(id)}
        onChanged={() => router.refresh()}
      />

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
