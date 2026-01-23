"use client";

import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDateRangePickerProps {
  className?: string;
  date?: DateRange;
  setDate: (date?: DateRange) => void;
}

export function CalendarDateRangePicker({
  className,
  date,
  setDate,
}: CalendarDateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "h-8 justify-start text-left font-normal border-dashed",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMM", { locale: it })} -{" "}
                  {format(date.to, "d MMM", { locale: it })}
                </>
              ) : (
                format(date.from, "d MMM", { locale: it })
              )
            ) : (
              <span>Seleziona date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={it}
            showOutsideDays={false}
            className="rounded-lg border shadow-sm"
            classNames={{
              today:
                "bg-transparent border rounded-md !text-primary border-primary !font-bold !underline hover:bg-primary/10",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
