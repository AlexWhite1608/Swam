"use client";

import { Table } from "@tanstack/react-table";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { bookingStatusOptions, paymentStatusOptions } from "@/schemas/bookingsSchema";
interface BookingTableToolbarProps<TData> {
  table: Table<TData>;
}

export function BookingTableToolbar<TData>({
  table,
}: BookingTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* filter for name and email for main guest */}
        <Input
          placeholder="Cerca ospite principale..."
          value={(table.getColumn("guest")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("guest")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* //TODO: Date Range Picker Placeholder */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed text-muted-foreground"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Seleziona date
        </Button>

        {/* booking status filter */}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Stato"
            options={bookingStatusOptions}
          />
        )}

        {/* payment status filter */}
        {table.getColumn("paymentStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("paymentStatus")}
            title="Pagamento"
            options={paymentStatusOptions}
          />
        )}

        {/* Reset */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Cancella filtri
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* //TODO: Qui potremmo mettere azioni globali come "Export Excel" oppure backup */}
    </div>
  );
}
