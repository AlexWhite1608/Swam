"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/**
 * Component for rendering view options for a data table, allowing users to toggle the visibility of columns.
 *
 * @template TData - The type of data used in the table.
 * @param {DataTableViewOptionsProps<TData>} props - The props for the component.
 * @param {Table<TData>} props.table - The table instance from @tanstack/react-table.
 *
 * @returns {JSX.Element} A dropdown menu with checkboxes for each column that can be hidden or shown.
 *
 * @remarks
 * - Only columns with an accessor function and that can be hidden are shown in the menu.
 * - Uses Radix UI dropdown components and custom UI components for styling.
 * - Column titles are formatted by inserting spaces before capital letters.
 */
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="h-4 w-4" />
          Vista
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Mostra colonne</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {/* //fixme: improve column title formatting
                 */}
                {column.id.replace(/([A-Z])/g, " $1").trim()}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
