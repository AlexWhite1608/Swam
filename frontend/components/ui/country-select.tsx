"use client";

import countries from "i18n-iso-countries";
import itLocale from "i18n-iso-countries/langs/it.json";
import { Check, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import { useState, useMemo } from "react";

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
import { FlagComponent } from "../common/FlagComponent";

countries.registerLocale(itLocale);

// country list in italian
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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCountryName = value
    ? countries.getName(value, "it")
    : undefined;

  // Logica di filtro e ordinamento manuale (uguale a PlaceInput)
  const filteredCountryList = useMemo(() => {
    if (!searchQuery) return countryList;

    const query = searchQuery.toLowerCase();

    return countryList
      .filter(
        ({ name, code }) =>
          // find both by name and code
          name.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        // max priority: Exact match
        if (nameA === query && nameB !== query) return -1;
        if (nameB === query && nameA !== query) return 1;

        // high priority: Starts with query
        const startsA = nameA.startsWith(query);
        const startsB = nameB.startsWith(query);

        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        // fallback: alphabetical
        return nameA.localeCompare(nameB);
      });
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between pl-3 text-left font-normal min-w-0 overflow-hidden",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            {value ? (
              <>
                <FlagComponent
                  country={value as RPNInput.Country}
                  countryName={value}
                  className="shrink-0"
                />
                <span className="truncate">{selectedCountryName}</span>
              </>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cerca nazione..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {filteredCountryList.length === 0 && (
              <CommandEmpty>Nessuna nazione trovata.</CommandEmpty>
            )}
            <CommandGroup>
              <ScrollArea className="h-[240px]">
                {filteredCountryList.map(({ code, name }) => (
                  <CommandItem
                    key={code}
                    value={name}
                    onSelect={() => {
                      onChange(code);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <FlagComponent
                        country={code}
                        countryName={name}
                        className="shrink-0"
                      />

                      <span className="truncate flex-1 min-w-0">{name}</span>

                      {value === code && (
                        <Check className="ml-auto h-4 w-4 shrink-0 opacity-100" />
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
