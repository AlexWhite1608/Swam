"use client";

import { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusOptions, typeOptions } from "@/schemas/resourcesSchema";

interface ResourceTableToolbarProps<TData> {
  table: Table<TData>;
  onDeleteSelected: (rows: TData[]) => void;
}

export function ResourceTableToolbar<TData>({
  table,
  onDeleteSelected,
}: ResourceTableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isSelectionActive = selectedRows.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtra risorse..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* filters */}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            hasIcon
            column={table.getColumn("status")}
            title="Stato"
            options={statusOptions}
          />
        )}
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            hasIcon
            column={table.getColumn("type")}
            title="Tipo"
            options={typeOptions}
          />
        )}
      </div>

      {/* bulk delete action */}
      {/* //fixme: deve stare nella data-table? */}
      {isSelectionActive && (
        <div className="flex flex-1 justify-end ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
            onClick={() =>
              onDeleteSelected(selectedRows.map((r) => r.original))
            }
          >
            <Trash2 className="h-4 w-4" />
            Cancella selezionati
          </Button>
        </div>
      )}
    </div>
  );
}
