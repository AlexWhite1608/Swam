"use client";

import { Trash2 } from "lucide-react";
import { Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { BirthDateInput } from "@/components/ui/birth-date-input";
import { PlaceInput } from "@/components/ui/place-input";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";
import {
  guestRoleOptions,
  guestTypeOptions,
  sexOptions,
} from "@/types/bookings/options";
import { CountrySelect } from "../ui/country-select";
import { DatePicker } from "../ui/date-picker";
import { isBefore, parseISO, isAfter } from "date-fns";

interface CompanionCardProps {
  index: number;
  control: Control<CheckInFormValues>;
  checkInDate: string;
  checkOutDate: string;
  isChained: boolean;
  onRemove: () => void;
}

export function CompanionCard({
  index,
  control,
  checkInDate,
  checkOutDate,
  isChained,
  onRemove,
}: CompanionCardProps) {
  return (
    <div className="relative p-4 rounded-lg border bg-card transition-colors group">
      {/* remove button */}
      <Button
        type="button"
        variant="link"
        size="icon"
        className="absolute top-1 right-1 transition-opacity text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-12 gap-3 pr-6">
        {/* Riga 1: Nome, Cognome, Sesso, Data Nascita */}
        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.firstName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inserisci nome"
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.lastName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Cognome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inserisci cognome"
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.sex`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Sesso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sexOptions.map((option) => (
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
        </div>

        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.birthDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Data Nascita</FormLabel>
                <FormControl>
                  <BirthDateInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="gg/mm/aaaa"
                    className="h-8"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Riga 2: Cittadinanza, Luogo Nascita, Fascia Età, Ruolo */}
        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.citizenship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Cittadinanza</FormLabel>
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Cittadinanza"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-3 min-w-0">
          <PlaceInput
            control={control}
            nationalityField={`companions.${index}.citizenship`}
            placeField={`companions.${index}.placeOfBirth`}
            label="Luogo di Nascita"
          />
        </div>

        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.guestType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Fascia Età</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guestTypeOptions.map((option) => (
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
        </div>

        <div className="col-span-3 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.guestRole`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Ruolo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {guestRoleOptions
                      .filter((option) => option.value === "MEMBER")
                      .map((option) => (
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
        </div>

        {/* arrival/departures dates */}
        <div className="col-span-6 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.arrivalDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Data di Arrivo
                </FormLabel>
                <FormControl>
                  <DatePicker
                    disabledDates={(date) =>
                      isBefore(date, parseISO(checkInDate)) ||
                      isAfter(date, parseISO(checkOutDate))
                    }
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleziona data arrivo"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-6 min-w-0">
          <FormField
            control={control}
            name={`companions.${index}.departureDate`}
            render={({ field }) => {
              const arrivalDate = useWatch({
                control,
                name: `companions.${index}.arrivalDate`,
              });

              const isDeparturePastCheckout =
                field.value && isAfter(field.value, parseISO(checkOutDate));

              return (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Data di Partenza
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      disabledDates={(date) => {
                        // dates before booking check-in
                        if (isBefore(date, parseISO(checkInDate))) return true;

                        // dates after booking check-out
                        if (isAfter(date, parseISO(checkOutDate))) return true;

                        // if there is an arrival date, disable dates before it
                        if (arrivalDate && isBefore(date, arrivalDate))
                          return true;

                        return false;
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleziona data partenza"
                    />
                  </FormControl>
                  {isDeparturePastCheckout && !isChained && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      La data di partenza supera il checkout della prenotazione.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
