import { clsx, type ClassValue } from "clsx";
import { areIntervalsOverlapping, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// formats a number as EUR currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// returns initials from first and last name
export const getInitials = (first: string, last: string) => {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

// filter function for date range on booking period
export const dateRangeFilterFn = (
  row: any,
  columnId: string,
  filterValue: DateRange | undefined,
) => {
  if (!filterValue || !filterValue.from) return true;

  const filterFrom = filterValue.from;
  const filterTo = filterValue.to || filterValue.from;

  const rowStart =
    typeof row.original.checkIn === "string"
      ? parseISO(row.original.checkIn)
      : row.original.checkIn;

  const rowEnd =
    typeof row.original.checkOut === "string"
      ? parseISO(row.original.checkOut)
      : row.original.checkOut;

  // check for overlap
  return areIntervalsOverlapping(
    { start: rowStart, end: rowEnd },
    { start: filterFrom, end: filterTo },
    { inclusive: true },
  );
};

export const PHONE_PREFIXES = [
  { value: "+39", label: "🇮🇹 +39" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+34", label: "🇪🇸 +34" },
];
