"use client";

import countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FlagComponent } from "./phone-input";

countries.registerLocale(itLocale);

// conutry list in italian
const countryObj = countries.getNames("it");

const countryList = Object.entries(countryObj)
  .map(([code, name]) => ({
    code: code as RPNInput.Country,
    name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Seleziona...",
  className,
  disabled,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCountryName = value
    ? countries.getName(value, "it")
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <FlagComponent
                  country={value as RPNInput.Country}
                  countryName={value}
                />
                <span className="truncate">{selectedCountryName}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command
          // custom filter to search by name or code
          filter={(value, search) => {
            const cleanSearch = search.toLowerCase();
            const cleanValue = value.toLowerCase();
            if (cleanValue.includes(cleanSearch)) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Cerca nazione..." />
          <CommandList>
            <CommandEmpty>Nessuna nazione trovata.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[240px]">
                {countryList.map(({ code, name }) => (
                  <CommandItem
                    key={code}
                    value={name}
                    keywords={[code, name]}
                    onSelect={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <FlagComponent country={code} countryName={name} />

                      <span className="truncate flex-1">{name}</span>

                      {value === code && (
                        <Check className="ml-auto h-4 w-4 opacity-100" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
