"use client";

import { Column } from "@tanstack/react-table";
import { Check, ChevronDown, Filter } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DataTableFacetedFilterProps<TData, TValue> {
  className?: string;
  column?: Column<TData, TValue>;
  hasIcon?: boolean;
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
 * @param {boolean} [props.hasIcon=false] - Whether to display an icon on the filter button.
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
  className,
  column,
  title,
  options,
  hasIcon = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9", className)}>
          {hasIcon && <Filter className=" h-4 w-4" />}
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

          {selectedValues?.size === 0 && (
            <ChevronDown className="ml-auto h-4 w-4 opacity-50 shrink-0" />
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
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
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

// Helper layout component for filter sections
export function FilterSection({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
