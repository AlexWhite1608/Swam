"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  useCreateBooking,
  useUnavailableDates,
} from "@/hooks/tanstack-query/useBookings";
import { useResources } from "@/hooks/tanstack-query/useResources";

import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDisabledDays } from "@/hooks/useDisabledDays";
import {
  createBookingFormSchema,
  CreateBookingFormValues,
} from "@/schemas/bookingsSchema";
import { format } from "date-fns";
import italialLabels from "react-phone-number-input/locale/it.json";
import { ResourceStatusBadge } from "@/components/common/badges/ResourceStatusBadge";
import { ResourceSelect } from "@/components/ui/resource-select";

interface BookingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const { data: resources, isLoading: isLoadingResources } = useResources();
  const createBookingMutation = useCreateBooking();

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

  // get unavailable dates for selected resource
  const selectedResourceId = form.watch("resourceId");
  const { data: unavailablePeriods } = useUnavailableDates(selectedResourceId);

  const selectedResource = resources?.find((r) => r.id === selectedResourceId);

  const { occupiedDatesMatchers, allDisabledDates } =
    useDisabledDays(unavailablePeriods);

  const onSubmit = (values: CreateBookingFormValues) => {
    const payload = {
      ...values,
      checkIn: format(values.checkIn!, "yyyy-MM-dd"),
      checkOut: format(values.checkOut!, "yyyy-MM-dd"),
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
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="resourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risorsa</FormLabel>
                  <FormControl>
                    <ResourceSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      resources={resources}
                      isLoading={isLoadingResources}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date Range Picker */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Periodo Soggiorno</FormLabel>
                <DateRangePicker
                  buttonClassName=" h-9 border border-input hover:bg-background text-muted-foreground justify-start text-left"
                  disabledDates={allDisabledDates}
                  occupiedDates={occupiedDatesMatchers}
                  disableButton={!selectedResourceId}
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
                <FormMessage />
                {form.formState.errors.checkOut && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.checkOut.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* main guest info */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Dati Ospite Principale
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

        <Separator />

        {/* actions */}
        <div className="flex justify-end gap-2">
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
