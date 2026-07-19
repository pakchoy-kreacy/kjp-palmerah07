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
import { Search, ChevronLeft, ChevronRight, AlertCircle, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface StudentRef {
  nisn: string;
  name: string;
  class: string;
}

const columnHelper = createColumnHelper<StudentRef>();

export function ReferensiTable({ initialRows }: { initialRows: StudentRef[] }) {
  const [data] = React.useState(initialRows);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const classes = React.useMemo(
    () => Array.from(new Set(initialRows.map((r) => r.class))).sort(),
    [initialRows]
  );

  const columns = [
    columnHelper.accessor("nisn", {
      header: "NISN",
      cell: (c) => <span className="font-mono text-sm font-semibold text-gray-800">{c.getValue()}</span>,
    }),
    columnHelper.accessor("name", {
      header: "Nama",
      cell: (c) => <span className="font-medium text-gray-700">{c.getValue()}</span>,
    }),
    columnHelper.accessor("class", {
      header: "Kelas",
      cell: (c) => <span className="text-sm text-gray-500">{c.getValue()}</span>,
    }),
  ];

  const filtered = React.useMemo(() => {
    return data.filter((r) => {
      if (classFilter !== "all" && r.class !== classFilter) return false;
      if (globalFilter && !`${r.name} ${r.nisn}`.toLowerCase().includes(globalFilter.toLowerCase())) return false;
      return true;
    });
  }, [data, classFilter, globalFilter]);

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

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <BookOpen className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-700">Belum ada data referensi</h3>
        <p className="mt-1 text-sm text-gray-400">Import data siswa untuk melihat daftar referensi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari NISN / Nama..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                <TableCell colSpan={3} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-200" />
                    <p className="text-sm font-medium text-gray-400">Tidak ada data yang cocok</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-gray-100 transition-colors hover:bg-gray-50">
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

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{table.getFilteredRowModel().rows.length} siswa</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold text-gray-600 min-w-[60px] text-center">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
