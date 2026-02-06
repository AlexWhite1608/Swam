"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import * as React from "react";
import { Matcher } from "react-day-picker";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: Matcher | Matcher[];
  occupiedDates?: Matcher | Matcher[];
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleziona data",
  className,
  disabled,
  disabledDates,
  occupiedDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {value ? format(value, "d MMMM yyyy", { locale: it }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          locale={it}
          disabled={disabledDates}
          showOutsideDays={false}
          modifiers={{
            occupied: occupiedDates || [],
          }}
          modifiersClassNames={{
            occupied:
              "relative after:content-[''] after:absolute after:bottom-[2px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-red-500 after:rounded-full",
          }}
          classNames={{
            today:
              "bg-transparent border rounded-md !text-primary border-primary !font-bold !underline hover:bg-primary/10",
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
