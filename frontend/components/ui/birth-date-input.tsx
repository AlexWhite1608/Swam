"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";

interface BirthDateInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function BirthDateInput({
  value,
  onChange,
  placeholder = "gg/mm/aaaa",
  className,
  disabled,
}: BirthDateInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy", { locale: it }));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // parse date when complete
    if (newValue.length === 10) {
      try {
        const parsedDate = parse(newValue, "dd/MM/yyyy", new Date(), {
          locale: it,
        });
        if (!isNaN(parsedDate.getTime())) {
          onChange(parsedDate);
        }
      } catch (error) {
      }
    } else if (newValue === "") {
      onChange(undefined);
    }
  };

  // handle date selection from calendar
  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  // format input value as dd/mm/yyyy while typing
  const formatInputValue = (value: string) => {
    // removes non-numeric characters
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "Enter", "/", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          const formatted = formatInputValue(e.target.value);
          setInputValue(formatted);
          handleInputChange({ ...e, target: { ...e.target, value: formatted } });
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 min-w-[280px]" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            locale={it}
            defaultMonth={value || new Date()}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0, 1)}
            endMonth={new Date()}
            disabled={{ after: new Date() }}
            formatters={{
              formatMonthDropdown: (date) =>
                format(date, "MMMM", { locale: it }),
            }}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}