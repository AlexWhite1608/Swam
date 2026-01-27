"use client";

import { format, Locale, eachDayOfInterval } from "date-fns";
import { it, se } from "date-fns/locale";
import { DateRange, Matcher, isMatch } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

interface CalendarDateRangePickerProps {
  className?: string;
  buttonClassName?: string;
  date?: DateRange;
  setDate: (date?: DateRange) => void;
  onUpdate?: (range?: DateRange) => void;
  align?: "start" | "center" | "end";
  locale?: Locale;
  disabledDates?: Matcher | Matcher[]; // dates that cannot be selected
  occupiedDates?: Matcher | Matcher[]; // occupied dates to highlight
  disableButton?: boolean;
}

export function DateRangePicker({
  className,
  date,
  setDate,
  onUpdate,
  buttonClassName,
  align = "start",
  locale = it,
  disabledDates = [],
  occupiedDates = [],
  disableButton = false,
}: CalendarDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date);

  const openedRangeRef = useRef<DateRange | undefined>(date);

  useEffect(() => {
    if (!isOpen) {
      setInternalDate(date);
      openedRangeRef.current = date;
    }
  }, [date, isOpen]);

  const resetValues = () => {
    setInternalDate(openedRangeRef.current);
  };

  // handle date selection from calendar
  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const daysInRange = eachDayOfInterval({
        start: range.from,
        end: range.to,
      });

      // check if any day in the selected range matches the disabled dates
      const isInvalidSelection = daysInRange.some(
        (day) => isMatch(day, disabledDates), // fixme: deprecated function
      );

      if (isInvalidSelection) {
        toast.error("Il periodo selezionato include date non disponibili.");
        setInternalDate({ from: undefined, to: undefined });
        return;
      }
    }

    setInternalDate(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            openedRangeRef.current = date;
            setInternalDate(date);
          } else {
            resetValues();
          }
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disableButton}
            size="sm"
            className={cn(
              "h-8 justify-start text-left",
              !internalDate && "text-muted-foreground",
              buttonClassName,
            )}
          >
            {internalDate?.from ? (
              internalDate.to ? (
                <>
                  {format(internalDate.from, "d MMM yyyy", { locale })} -{" "}
                  {format(internalDate.to, "d MMM yyyy", { locale })}
                </>
              ) : (
                format(internalDate.from, "d MMM yyyy", { locale })
              )
            ) : (
              <span>Seleziona date</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align={align}>
          <div className="p-2">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={internalDate?.from}
              selected={internalDate}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={locale}
              disabled={disabledDates}
              showOutsideDays={false}
              className="border-b"
              modifiers={{
                occupied: occupiedDates,
              }}
              modifiersClassNames={{
                occupied:
                  "relative after:content-[''] after:absolute after:bottom-[2px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-red-500 after:rounded-full",
              }}
              classNames={{
                today:
                  "bg-transparent border rounded-md !text-primary border-primary !font-bold !underline hover:bg-primary/10",
              }}
            />
          </div>

          <div className="flex justify-between gap-2 py-2 mb-2 pr-4">
            <Button
              variant="ghost"
              onClick={() =>
                setInternalDate({ from: undefined, to: undefined })
              }
              className="ml-2 text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" />
              Resetta
            </Button>

            <div className="flex w-full sm:w-auto justify-end gap-2">
              <Button
                onClick={() => {
                  resetValues();
                  setIsOpen(false);
                }}
                variant="outline"
              >
                Annulla
              </Button>
              <Button
                onClick={() => {
                  setDate(internalDate);
                  onUpdate?.(internalDate);
                  setIsOpen(false);
                }}
              >
                Applica
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
