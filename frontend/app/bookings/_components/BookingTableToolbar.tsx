"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CalendarDateRangePicker } from "@/components/common/CalendarDateRangePicker";
import {
  bookingStatusOptions,
  paymentStatusOptions,
} from "@/schemas/bookingsSchema";
import { DateRange } from "react-day-picker";
interface BookingTableToolbarProps<TData> {
  table: Table<TData>;
}

export function BookingTableToolbar<TData>({
  table,
}: BookingTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const periodColumn = table.getColumn("period");

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

        {/* date range filter for period */}
        {periodColumn && (
          <CalendarDateRangePicker
            buttonClassName="border-dashed"
            date={periodColumn.getFilterValue() as DateRange | undefined}
            setDate={(date) => periodColumn.setFilterValue(date)}
          />
        )}

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
            variant="link"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Cancella filtri
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* //TODO: Qui potremmo mettere azioni globali come "Export Excel" oppure backup */}
    </div>
  );
}
