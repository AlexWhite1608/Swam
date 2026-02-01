"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";
import { documentTypeOptions } from "@/types/bookings/options";
import { Control } from "react-hook-form";
import { PlaceInput } from "../ui/place-input";

interface DocumentFieldsProps {
  control: Control<CheckInFormValues>;
}

export function DocumentFields({ control }: DocumentFieldsProps) {
  return (
    <div className="bg-muted/40 p-4 rounded-lg border border-border/60 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          Documento d&apos;Identità
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero</FormLabel>
              <FormControl>
                <Input className="bg-background" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PlaceInput
          control={control}
          placeField="documentPlaceOfIssue"
          label="Rilasciato a"
          className="w-full"
        />
      </div>
    </div>
  );
}
