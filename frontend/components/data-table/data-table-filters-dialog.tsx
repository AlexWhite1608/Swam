"use client";

import * as React from "react";
import { Table as TanStackTable, ColumnFiltersState } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shadow-sm border-dashed"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtri
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary w-4 h-4 text-[10px] flex items-center justify-center text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-primary">Filtri</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 overflow-y-auto px-1">
          {renderFilters(filterTable)}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => filterTable.resetColumnFilters()}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            Resetta
          </Button>

          <Button onClick={onApplyFilters} className="w-full sm:w-auto">
            Applica filtri{" "}
            {draftFilterCount > 0 && `(${draftFilterCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}