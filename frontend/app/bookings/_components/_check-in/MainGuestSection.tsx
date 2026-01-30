"use client";

import { DocumentFields } from "@/components/common/DocumentFields";
import { BirthDateInput } from "@/components/ui/birth-date-input";
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
import { GuestRole, GuestType } from "@/types/bookings/enums";
import {
  guestRoleOptions,
  guestTypeOptions,
  sexOptions,
} from "@/types/bookings/options";
import { format } from "date-fns";
import { Contact, Fingerprint, User, Users } from "lucide-react";
import { Control } from "react-hook-form";

//FIXME: Mock data - In futuro sposta in un hook o constants
const COUNTRIES = [
  { code: "IT", name: "Italia" },
  { code: "DE", name: "Germania" },
  { code: "FR", name: "Francia" },
  { code: "US", name: "Stati Uniti" },
  { code: "GB", name: "Regno Unito" },
  { code: "ES", name: "Spagna" },
];

interface MainGuestSectionProps {
  control: Control<CheckInFormValues>;
}

export function MainGuestSection({ control }: MainGuestSectionProps) {
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
  ) => {
    const dateVal = e.target.value ? new Date(e.target.value) : undefined;
    onChange(dateVal);
  };

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
          <div className="col-span-12 md:col-span-5">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Mario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* last name */}
          <div className="col-span-12 md:col-span-5">
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* sex */}
          <div className="col-span-6 md:col-span-2">
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

        {/* birth and citizenship seciton */}
        <div className="grid grid-cols-12 gap-4">
          {/* date of birth */}
          <div className="col-span-12 md:col-span-4">
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

          {/* place of birth */}
          <div className="col-span-12 md:col-span-4">
            <PlaceInput
              control={control}
              className="w-full"
              nationalityField="citizenship"
              placeField="placeOfBirth"
              label="Luogo di Nascita"
            />
          </div>

          {/* citizenship */}
          <div className="col-span-12 md:col-span-4">
            <FormField
              control={control}
              name="citizenship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cittadinanza</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
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
      </div>

      {/* documents section */}
      <DocumentFields control={control} />

      {/* contacts and guest role/type */}
      <div className="grid grid-cols-10 gap-6 pt-2">
        {/* email and phone number */}
        <div className="space-y-3 col-span-6">
          <div className="flex items-center gap-2 text-primary pb-1 border-b border-dashed">
            <h4 className="text-sm font-semibold">Contatti</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Colonna Destra: Ruolo e Classificazione */}
        <div className="space-y-3 col-span-4">
          <div className="flex items-center gap-2 text-primary pb-1 border-b border-dashed">
            <h4 className="text-sm font-semibold">Classificazione</h4>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
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
            <div className="col-span-3">
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
                        {guestRoleOptions.map((option) => (
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
    </div>
  );
}
