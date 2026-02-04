"use client";

import { DocumentFields } from "@/components/common/DocumentFields";
import { BirthDateInput } from "@/components/ui/birth-date-input";
import { CountrySelect } from "@/components/ui/country-select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PlaceInput } from "@/components/ui/place-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";
import {
  guestRoleOptions,
  guestTypeOptions,
  sexOptions,
} from "@/types/bookings/options";
import { isAfter, isBefore, parseISO } from "date-fns";
import { User } from "lucide-react";
import { Control, useWatch } from "react-hook-form";
import { Country } from "react-phone-number-input";

interface MainGuestSectionProps {
  control: Control<CheckInFormValues>;
  checkInDate: string;
  checkOutDate: string;
  isChained: boolean;
}

export function MainGuestSection({
  control,
  checkInDate,
  checkOutDate,
  isChained,
}: MainGuestSectionProps) {
  // watch citizenship
  const citizenship = useWatch({
    control,
    name: "citizenship",
  });

  return (
    <div className="space-y-5">
      {/* main guest data */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b text-primary">
          <User className="h-5 w-5" />
          <h3 className="font-semibold">Ospite Principale</h3>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* first name */}
          <div className="col-span-12 md:col-span-5 min-w-0">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* last name */}
          <div className="col-span-12 md:col-span-5 min-w-0">
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci cognome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* sex */}
          <div className="col-span-12 md:col-span-2 min-w-0">
            <FormField
              control={control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sesso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
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
        </div>

        {/* birth and citizenship section */}
        <div className="grid grid-cols-12 gap-4">
          {/* date of birth */}
          <div className="col-span-12 md:col-span-4 min-w-0">
            <FormField
              control={control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data di Nascita</FormLabel>
                  <FormControl>
                    <BirthDateInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="gg/mm/aaaa"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* citizenship */}
          <div className="col-span-12 md:col-span-4 min-w-0">
            <FormField
              control={control}
              name="citizenship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cittadinanza</FormLabel>
                  <CountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleziona cittadinanza"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* place of birth */}
          <div className="col-span-12 md:col-span-4 min-w-0">
            <PlaceInput
              control={control}
              className="w-full"
              nationalityField="citizenship"
              placeField="placeOfBirth"
              label="Luogo di Nascita"
            />
          </div>
        </div>
      </div>

      {/* documents section */}
      <DocumentFields control={control} />

      {/* contacts and guest role/type */}
      <div className="grid grid-cols-10 gap-6">
        {/* email and phone number */}
        <div className="space-y-3 col-span-6">
          <div className="flex items-center gap-2 text-primary pb-1 border-b border-dashed">
            <h4 className="text-sm font-semibold">Contatti</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cliente@email.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="min-w-0">
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <PhoneInput
                        className="w-full"
                        placeholder="Inserisci telefono"
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry={citizenship as Country}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* guest type and guest role */}
        <div className="space-y-3 col-span-4">
          <div className="flex items-center gap-2 text-primary pb-1 border-b border-dashed">
            <h4 className="text-sm font-semibold">Classificazione</h4>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2 min-w-0">
              <FormField
                control={control}
                name="guestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fascia Età</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 min-w-0">
              <FormField
                control={control}
                name="guestRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guestRoleOptions
                          .filter((option) => option.value !== "MEMBER")
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* arrival and departure dates */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-dashed text-primary">
          <h4 className="text-sm font-semibold">Permanenza</h4>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 min-w-0">
            <FormField
              control={control}
              name="arrivalDate"
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
          <div className="col-span-12 md:col-span-6 min-w-0">
            <FormField
              control={control}
              name="departureDate"
              render={({ field }) => {
                const arrivalDate = useWatch({
                  control,
                  name: "arrivalDate",
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
                          if (isBefore(date, parseISO(checkInDate)))
                            return true;

                          // dates after booking check-out
                          if (isAfter(date, parseISO(checkOutDate)))
                            return true;

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
                        La data di partenza supera il checkout della
                        prenotazione.
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
    </div>
  );
}
