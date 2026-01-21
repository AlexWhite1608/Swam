"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

/**
 * Renders a column header for a data table with sorting controls.
 *
 * Displays the column title and, if the column is sortable, provides a button
 * for cycling through sort states (none → ascending → descending → none).
 * The sort status is indicated by an icon next to the title.
 *
 * @template TData - The type of the row data.
 * @template TValue - The type of the column value.
 * @param {DataTableColumnHeaderProps<TData, TValue>} props - The props for the component.
 * @param {Column<TData, TValue>} props.column - The column instance from TanStack Table.
 * @param {string} props.title - The display title for the column header.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} The rendered column header component.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSorted = column.getIsSorted();

  // if the column is not sortable, just render the title
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "-ml-3 h-8",
          isSorted && "underline"
        )}
        onClick={() => {
          // Cycle through: none → asc → desc → none
          const currentSort = column.getIsSorted();
          if (currentSort === false) {
            column.toggleSorting(false); // Set to ascending
          } else if (currentSort === "asc") {
            column.toggleSorting(true); // Set to descending
          } else {
            column.clearSorting();
          }
        }}
      >
        <span>{title}</span>
        {/* show icon based on sort status */}
        {column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-4 w-4 text-primary " />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronsUpDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}