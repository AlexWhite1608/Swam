"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Check, Filter, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

/**
 * A faceted filter component for data tables, allowing users to filter table rows by selecting multiple options.
 *
 * @template TData - The type of the table data.
 * @template TValue - The type of the filter value.
 *
 * @param {Object} props - The component props.
 * @param {Column<TData, TValue>} [props.column] - The table column to apply the filter to.
 * @param {string} [props.title] - The title displayed on the filter button.
 * @param {Array} props.options - The list of filter options, each with a label, value, and optional icon.
 *
 * @example
 * <DataTableFacetedFilter
 *   column={column}
 *   title="Status"
 *   options={[
 *     { label: "Active", value: "active", icon: ActiveIcon },
 *     { label: "Inactive", value: "inactive", icon: InactiveIcon }
 *   ]}
 * />
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Filter className=" h-4 w-4" />
          {title}

          {/* badge selection counter */}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="outline"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="outline"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selezionati
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="outline"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Nessun risultato</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                    className={cn(
                      "flex justify-between items-center group [&:hover_.check-icon]:text-primary-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <option.icon className="h-4 w-4 hover:text-foreground" />
                      )}
                      <span>{option.label}</span>
                    </div>
                    {/* //FIXME: bug su hover se esco dal dropdown */}
                    <Check
                      className={cn(
                        "h-4 w-4 check-icon",
                        isSelected ? "text-primary" : "invisible",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
