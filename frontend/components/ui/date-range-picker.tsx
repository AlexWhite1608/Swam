"use client";

import { format, Locale } from "date-fns";
import { it } from "date-fns/locale";
import { DateRange, Matcher } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface CalendarDateRangePickerProps {
  className?: string;
  buttonClassName?: string;
  date?: DateRange;
  setDate: (date?: DateRange) => void;
  onUpdate?: (range?: DateRange) => void;
  align?: "start" | "center" | "end";
  locale?: Locale;
  disabledDates?: Matcher | Matcher[];
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
  disabledDates,
  disableButton = false,
}: CalendarDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<DateRange | undefined>(date);

  const openedRangeRef = useRef<DateRange | undefined>(date);

  useEffect(() => {
    // keep internal in sync when parent changes selection
    if (!isOpen) {
      setInternalDate(date);
      openedRangeRef.current = date;
    }
  }, [date, isOpen]);

  const resetValues = () => {
    setInternalDate(openedRangeRef.current);
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
            // reset to the values that were present when the popover opened
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
              onSelect={(d) => setInternalDate(d)}
              numberOfMonths={2}
              locale={locale}
              disabled={disabledDates}
              showOutsideDays={false}
              className="border-b"
              classNames={{
                today:
                  "bg-transparent border rounded-md !text-primary border-primary !font-bold !underline hover:bg-primary/10",
              }}
            />
          </div>

          <div className="flex justify-end gap-2 py-2 pr-4">
            <Button
              onClick={() => {
                // cancel -> restore to opened values and close
                resetValues();
                setIsOpen(false);
              }}
              variant="ghost"
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                // apply -> propagate and close
                setDate(internalDate);
                onUpdate?.(internalDate);
                setIsOpen(false);
              }}
            >
              Applica
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
