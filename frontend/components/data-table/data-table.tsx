"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  HeaderGroup,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableFiltersDialog } from "@/components/data-table/data-table-filters-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderToolbar?: (table: TanStackTable<TData>) => React.ReactNode;
  renderFilters?: (table: TanStackTable<TData>) => React.ReactNode;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderToolbar,
  renderFilters,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // filters dialog state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [draftFilters, setDraftFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // calculate filter counts
  const calculateFilterCount = (filters: ColumnFiltersState) => {
    return filters.reduce((acc, filter) => {
      if (Array.isArray(filter.value)) {
        return acc + filter.value.length;
      }
      return acc + 1;
    }, 0);
  };

  const activeFilterCount = calculateFilterCount(columnFilters);
  const draftFilterCount = calculateFilterCount(draftFilters);

  // main table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // shadow table for filters dialog
  const filterTable = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: draftFilters,
    },
    onColumnFiltersChange: setDraftFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftFilters([...columnFilters]);
    }
    setIsFilterOpen(open);
  };

  const handleApplyFilters = () => {
    setColumnFilters(draftFilters);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* toolbar area */}
      <div className="flex flex-wrap items-center gap-2">
        {renderToolbar && (
          <div className="flex flex-wrap items-center gap-2">
            {renderToolbar(table)}
          </div>
        )}

        {/* Filters dialog */}
        {renderFilters && (
          <DataTableFiltersDialog
            filterTable={filterTable}
            renderFilters={renderFilters}
            activeFilterCount={activeFilterCount}
            draftFilterCount={draftFilterCount}
            isOpen={isFilterOpen}
            onOpenChange={handleOpenChange}
            onApplyFilters={handleApplyFilters}
          />
        )}

        {/* Global Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="link"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Cancella filtri
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 rounded-md border overflow-auto relative min-h-0">
        <table className="w-full caption-bottom text-sm text-left">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b"
              >
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={index === 0 ? "w-12 pr-0" : ""}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`border-b transition-colors hover:bg-muted/50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="truncate max-w-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nessun risultato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}