"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Control, useWatch, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useItalianPlaces } from "@/hooks/tanstack-query/useItalianCities";
import { CountrySelect } from "./country-select";

interface PlaceInputProps {
  control: Control<any>;
  nationalityField?: string;
  placeField: string;
  label: string;
  className?: string;
  labelClassName?: string;
}

export function PlaceInput({
  control,
  nationalityField,
  placeField,
  label,
  className,
  labelClassName,
}: PlaceInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { setValue } = useFormContext() || {};

  // get citizenship value from form if nationalityField is provided
  const citizenship = useWatch({
    control,
    name: nationalityField || "citizenship",
  });

  // if no nationalityField provided, assume Italy for place input
  const isItaly = nationalityField ? citizenship === "IT" : true;

  // reset field when switching between Italy and other countries
  const prevIsItaly = useRef(isItaly);

  useEffect(() => {
    if (!prevIsItaly.current && isItaly) {
      if (setValue) {
        setValue(placeField, "");
        setSearchQuery("");
      }
    }
    prevIsItaly.current = isItaly;
  }, [isItaly, placeField, setValue]);

  const { data: cities, isLoading } = useItalianPlaces();

  const filteredCities =
    isItaly && cities && searchQuery.length > 0
      ? cities
          .filter((city) =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const query = searchQuery.toLowerCase();

            // max priority: Exact match
            if (nameA === query && nameB !== query) return -1;
            if (nameB === query && nameA !== query) return 1;

            // high priority: Starts with query
            const startsA = nameA.startsWith(query);
            const startsB = nameB.startsWith(query);

            if (startsA && !startsB) return -1;
            if (!startsA && startsB) return 1;

            // fallback: Alphabetical order
            return nameA.localeCompare(nameB);
          })
          .slice(0, 50)
      : [];

  return (
    <FormField
      control={control}
      name={placeField}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel className={cn(labelClassName)}>{label}</FormLabel>
          <FormControl>
            {isItaly ? (
              <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between pl-3 font-normal",
                      !field.value && "text-muted-foreground",
                      className,
                    )}
                  >
                    <span className="truncate text-left flex-1 mr-2">
                      {field.value ? field.value : "Comune"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Cerca comune..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {isLoading && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Caricamento comuni...
                        </div>
                      )}

                      {!isLoading &&
                        filteredCities.length === 0 &&
                        searchQuery.length > 0 && (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Nessun comune trovato.
                          </div>
                        )}

                      {!isLoading && searchQuery.length === 0 && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Digita per cercare...
                        </div>
                      )}

                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {filteredCities.map((city) => (
                            <CommandItem
                              key={city.istatCode}
                              value={city.name}
                              onSelect={() => {
                                field.onChange(city.name);
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-baseline gap-2 min-w-0 flex-1">
                                <span className="font-medium truncate">
                                  {city.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  ({city.province})
                                </span>
                              </div>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  field.value === city.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <CountrySelect
                value={field.value}
                onChange={field.onChange}
                className={className}
                placeholder="Stato"
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
