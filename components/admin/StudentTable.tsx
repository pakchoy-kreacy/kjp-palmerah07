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
import { ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
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
      cell: (c) => <span className="font-medium">{c.getValue()}</span>,
    }),
    columnHelper.accessor("nisn", { header: "NISN" }),
    columnHelper.accessor("class", { header: "Kelas" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (c) => <StatusBadge status={c.getValue() as any} />,
    }),
    columnHelper.accessor("docCount", {
      header: "Dokumen",
      enableSorting: false,
      cell: (c) => `${c.getValue()}/${c.row.original.docRequired}`,
    }),
    columnHelper.accessor("updatedAt", {
      header: "Terakhir Update",
      cell: (c) => (
        <span className="text-muted-foreground">
          {relativeTime(c.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "aksi",
      header: "Aksi",
      cell: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(c.row.original.applicationId);
          }}
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
    } catch {
      toast.error("Gagal export");
    }
  }

  const orderedIds = filtered.map((r) => r.applicationId);
  const selectedIndex = selectedId ? orderedIds.indexOf(selectedId) : -1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama / NISN..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="not_started">Belum Mulai</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Menunggu</SelectItem>
            <SelectItem value="needs_revision">Perlu Revisi</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={
                      h.column.getCanSort() ? "cursor-pointer select-none" : ""
                    }
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[
                      h.column.getIsSorted() as string
                    ] ?? ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(row.original.applicationId)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
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
          <span className="text-sm">
            {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount() || 1}
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
