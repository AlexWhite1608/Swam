"use client";

import { Table } from "@tanstack/react-table";
import { X, Trash2, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { statusOptions, typeOptions } from "@/schemas/resourcesSchema";

interface ResourceTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ResourceTableToolbar<TData>({
  table,
}: ResourceTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isSelectionActive = selectedRows.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* //fixme: bulk actions logic */}
        {isSelectionActive ? (
          <div className="flex items-center gap-2 bg-red-50 text-red-900 px-3 py-1.5 rounded-md border border-red-100 animate-in fade-in slide-in-from-left-2">
            <span className="text-sm font-medium">
              {selectedRows.length} selezionati
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 px-2 ml-2"
              onClick={() =>
                console.log(
                  "Bulk Delete",
                  selectedRows.map((r) => r.original),
                )
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Cancella tutti
            </Button>
          </div>
        ) : (
          /* default search */
          <Input
            placeholder="Filtra risorse..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}

        {/* filters */}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Stato"
            options={statusOptions}
          />
        )}
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Tipo"
            options={typeOptions}
          />
        )}

        {/* reset filters */}
        {isFiltered && (
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

      {/* view options */}
      {/* <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div> */}
    </div>
  );
}
