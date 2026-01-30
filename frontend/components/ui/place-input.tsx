"use client";

import { Control, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mock data - da sostituire con libreria reale
const ITALIAN_CITIES = [
  { name: "Milano", province: "MI" },
  { name: "Roma", province: "RM" },
  { name: "Napoli", province: "NA" },
  { name: "Torino", province: "TO" },
  { name: "Firenze", province: "FI" },
];

interface PlaceInputProps {
  control: Control<any>;
  nationalityField: string;
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
  const citizenship = useWatch({ control, name: nationalityField });
  const isItaly = citizenship === "IT";

  return (
    <FormField
      control={control}
      name={placeField}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn(labelClassName)}>{label}</FormLabel>
          <FormControl>
            {isItaly ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={cn("w-full", className)}>
                  <SelectValue placeholder="Seleziona comune" />
                </SelectTrigger>
                <SelectContent>
                  {ITALIAN_CITIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name} ({c.province})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // nation select input
              <Input
                placeholder="Inserisci nazione"
                className={cn("w-full", className)}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
