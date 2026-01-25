"use client";

import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Input } from "@/components/ui/input";
import { statusOptions, typeOptions } from "@/schemas/resourcesSchema";

interface ResourceTableToolbarProps<TData> {
  table: Table<TData>;
  onDeleteSelected: (rows: TData[]) => void;
}

export function ResourceTableToolbar<TData>({
  table,
}: ResourceTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          clearable
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
    </div>
  );
}
