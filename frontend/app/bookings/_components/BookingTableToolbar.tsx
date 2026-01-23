"use client";

import { Table } from "@tanstack/react-table";
// Rimosso import X e Button inutilizzati per il reset qui

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Input } from "@/components/ui/input";

import { CalendarDateRangePicker } from "@/components/common/CalendarDateRangePicker";
import {
  bookingStatusOptions,
  paymentStatusOptions,
} from "@/schemas/bookingsSchema";
import { DateRange } from "react-day-picker";
import { Resource } from "@/schemas/resourcesSchema";

interface BookingTableToolbarProps<TData> {
  table: Table<TData>;
  resources?: Resource[];
}

export function BookingTableToolbar<TData>({
  table,
}: BookingTableToolbarProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      <Input
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

export function BookingTableFilters<TData>({
  table,
  resources,
}: BookingTableToolbarProps<TData>) {
  const periodColumn = table.getColumn("period");

  return (
    <>
      {/* Date Range Filter */}
      {periodColumn && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Periodo
          </span>
          <CalendarDateRangePicker
            buttonClassName="w-full justify-start text-left font-normal"
            date={periodColumn.getFilterValue() as DateRange | undefined}
            setDate={(date) => periodColumn.setFilterValue(date)}
          />
        </div>
      )}

      {/* Resource Filter */}
      {table.getColumn("resourceId") && resources && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Risorsa
          </span>
          <DataTableFacetedFilter
            column={table.getColumn("resourceId")}
            title="Seleziona risorsa"
            options={resources.map((r) => ({ label: r.name, value: r.id }))}
          />
        </div>
      )}

      {/* Booking Status Filter */}
      {table.getColumn("status") && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Stato Prenotazione
          </span>
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Seleziona stato"
            options={bookingStatusOptions}
          />
        </div>
      )}

      {/* Payment Status Filter */}
      {table.getColumn("paymentStatus") && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Stato Pagamento
          </span>
          <DataTableFacetedFilter
            column={table.getColumn("paymentStatus")}
            title="Seleziona pagamento"
            options={paymentStatusOptions}
          />
        </div>
      )}
    </>
  );
}
