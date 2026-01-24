"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateBooking } from "@/hooks/tanstack-query/useBookings";
import { useResources } from "@/hooks/tanstack-query/useResources";

import { CalendarDateRangePicker } from "@/components/common/CalendarDateRangePicker";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form,
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
import { Separator } from "@/components/ui/separator";
import {
  createBookingFormSchema,
  CreateBookingFormValues,
} from "@/schemas/bookingsSchema";
import { PhoneInput } from "@/components/ui/phone-input";
import italialLabels from "react-phone-number-input/locale/it.json";

interface BookingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { data: resources, isLoading: isLoadingResources } = useResources();
  const createBookingMutation = useCreateBooking();

  const [phonePrefix, setPhonePrefix] = useState("+39");

  const form = useForm<CreateBookingFormValues>({
    resolver: zodResolver(createBookingFormSchema),
    defaultValues: {
      resourceId: "",
      guestFirstName: "",
      guestLastName: "",
      guestEmail: "",
      guestPhone: "",
      depositAmount: undefined,
      checkIn: undefined,
      checkOut: undefined,
    },
  });

  const onSubmit = (values: CreateBookingFormValues) => {
    const payload = {
      ...values,
      checkIn: values.checkIn.toISOString(),
      checkOut: values.checkOut.toISOString(),
    };

    createBookingMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      },
    });
  };

  const isSubmitting = createBookingMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* resource */}
          <FormField
            control={form.control}
            name="resourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risorsa</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingResources
                            ? "Caricamento..."
                            : "Seleziona risorsa"
                        }
                        className="truncate"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resources?.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <span className="truncate block max-w-[200px] md:max-w-[300px]">
                          {resource.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Range Picker */}
          {/* //fixme: andrebbero disattivate le date non disponibili per la risorsa selezionata? */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Periodo Soggiorno</FormLabel>
                <CalendarDateRangePicker
                  buttonClassName=" h-9 border border-input hover:bg-background text-muted-foreground justify-start text-left"
                  date={{
                    from: form.watch("checkIn"),
                    to: form.watch("checkOut"),
                  }}
                  setDate={(range) => {
                    if (range?.from) {
                      form.setValue("checkIn", range.from, {
                        shouldValidate: true,
                      });
                    }
                    if (range?.to) {
                      form.setValue("checkOut", range.to, {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* main guest info */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Dati Prenotante
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="guestFirstName"
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
            <FormField
              control={form.control}
              name="guestLastName"
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

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Inserisci email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestPhone"
              render={({ field }) => (
                <FormField
                  control={form.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="Inserisci telefono"
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="IT"
                          labels={italialLabels}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
          </div>
        </div>

        <Separator />

        {/* deposit */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acconto</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.valueAsNumber;
                      field.onChange(isNaN(val) ? 0 : val);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* actions */}
        <div className="flex justify-end pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Inserisci
          </Button>
        </div>
      </form>
    </Form>
  );
}
