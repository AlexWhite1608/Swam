import { Table } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";

import {
  DataTableFacetedFilter,
  FilterSection,
} from "@/components/data-table/data-table-faceted-filter";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  bookingStatusOptions,
  paymentStatusOptions,
} from "@/types/bookings/options";

export interface BookingTableFiltersProps<TData> {
  table: Table<TData>;
  resources?: { id: string; name: string }[];
}

export function BookingTableFilters<TData>({
  table,
  resources,
}: BookingTableFiltersProps<TData>) {
  const periodColumn = table.getColumn("period");
  const resourceColumn = table.getColumn("resourceId");
  const statusColumn = table.getColumn("status");
  const paymentColumn = table.getColumn("paymentStatus");

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      {periodColumn && (
        <FilterSection label="Periodo Soggiorno">
          <DateRangePicker
            buttonClassName="w-full justify-between font-normal h-9"
            date={periodColumn.getFilterValue() as DateRange | undefined}
            setDate={(date) => periodColumn.setFilterValue(date)}
          />
        </FilterSection>
      )}

      {/* Resource Filter */}
      {resourceColumn && resources && (
        <FilterSection label="Risorsa">
          <DataTableFacetedFilter
            column={resourceColumn}
            title="Tutte le risorse"
            options={resources.map((r) => ({ label: r.name, value: r.id }))}
            className="w-full justify-between"
          />
        </FilterSection>
      )}

      {/* Booking Status Filter */}
      {statusColumn && (
        <FilterSection label="Stato Prenotazione">
          <DataTableFacetedFilter
            column={statusColumn}
            title="Tutti gli stati"
            options={bookingStatusOptions}
            className="w-full justify-between"
          />
        </FilterSection>
      )}

      {/* Payment Status Filter */}
      {paymentColumn && (
        <FilterSection label="Stato Pagamento">
          <DataTableFacetedFilter
            column={paymentColumn}
            title="Tutti i pagamenti"
            options={paymentStatusOptions}
            className="w-full justify-between"
          />
        </FilterSection>
      )}
    </div>
  );
}
