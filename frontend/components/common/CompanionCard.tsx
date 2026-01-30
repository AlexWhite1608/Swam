// components/common/CompanionCard.tsx
"use client";

import { Trash2 } from "lucide-react";
import { Control } from "react-hook-form";
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

const COUNTRIES = [
  { code: "IT", name: "Italia" },
  { code: "DE", name: "Germania" },
  { code: "FR", name: "Francia" },
  { code: "US", name: "Stati Uniti" },
  { code: "GB", name: "Regno Unito" },
  { code: "ES", name: "Spagna" },
];

interface CompanionCardProps {
  index: number;
  control: Control<CheckInFormValues>;
  onRemove: () => void;
}

export function CompanionCard({
  index,
  control,
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
        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.firstName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Es. Mario"
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.lastName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Cognome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Es. Rossi"
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.sex`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Sesso</FormLabel>
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

        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.birthDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Data Nascita</FormLabel>
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
        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.citizenship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Cittadinanza</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-8 text-sm">
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

        <div className="col-span-3">
          <PlaceInput
            control={control}
            nationalityField={`companions.${index}.citizenship`}
            placeField={`companions.${index}.placeOfBirth`}
            label="Luogo Nascita"
            className="text-xs"
            labelClassName="text-xs"
          />
        </div>

        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.guestType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fascia Età</FormLabel>
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

        <div className="col-span-3">
          <FormField
            control={control}
            name={`companions.${index}.guestRole`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Ruolo</FormLabel>
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
      </div>
    </div>
  );
}
