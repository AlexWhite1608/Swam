"use client";

import { Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";

interface BookingTableToolbarProps<TData> {
  table: Table<TData>;
}

export function BookingTableToolbar<TData>({
  table,
}: BookingTableToolbarProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      {/* search input */}
      <Input
        clearable
        placeholder="Cerca ospite principale..."
        value={(table.getColumn("guest")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("guest")?.setFilterValue(event.target.value)
        }
        className="h-8 w-[150px] lg:w-[250px]"
      />
    </div>
  );
}
