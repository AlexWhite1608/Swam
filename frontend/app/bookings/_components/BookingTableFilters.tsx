import { CalendarDateRangePicker } from "@/components/common/CalendarDateRangePicker";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import {
  bookingStatusOptions,
  paymentStatusOptions,
} from "@/schemas/bookingsSchema";
import { Table } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

export interface BookingTableFiltersProps<TData> {
  table: Table<TData>;
  resources?: { id: string; name: string }[];
}

export function BookingTableFilters<TData>({
  table,
  resources,
}: BookingTableFiltersProps<TData>) {
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
