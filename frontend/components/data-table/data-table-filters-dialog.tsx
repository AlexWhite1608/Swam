"use client";

import * as React from "react";
import { Table as TanStackTable } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { DialogTrigger } from "@/components/ui/dialog";

interface DataTableFiltersDialogProps<TData> {
  filterTable: TanStackTable<TData>;
  renderFilters: (table: TanStackTable<TData>) => React.ReactNode;
  activeFilterCount: number;
  draftFilterCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: () => void;
}

export function DataTableFiltersDialog<TData>({
  filterTable,
  renderFilters,
  activeFilterCount,
  draftFilterCount,
  isOpen,
  onOpenChange,
  onApplyFilters,
}: DataTableFiltersDialogProps<TData>) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 shadow-sm"
        onClick={() => onOpenChange(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtri
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-primary w-4 h-4 text-[10px] flex items-center justify-center text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <BaseDataDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Filtri"
        className="sm:max-w-[425px]"
      >
        <div className="flex flex-col max-h-[60vh]">
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto px-1">
            {renderFilters(filterTable)}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => filterTable.resetColumnFilters()}
              className="w-full sm:w-auto"
            >
              Resetta
            </Button>

            <Button onClick={onApplyFilters} className="w-full sm:w-auto">
              Applica filtri {draftFilterCount > 0 && `(${draftFilterCount})`}
            </Button>
          </div>
        </div>
      </BaseDataDialog>
    </>
  );
}
