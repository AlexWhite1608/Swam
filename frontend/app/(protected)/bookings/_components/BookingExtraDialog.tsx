"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, ShoppingBag, Trash } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Button } from "@/components/ui/button";
import { ExtraSelect } from "@/components/ui/extra-select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateBookingExtras } from "@/hooks/tanstack-query/useBookings";
import { Booking } from "@/types/bookings/types";
import { ExtrasFormValues, extrasSchema } from "@/schemas/bookingExtraDialogSchema";

interface BookingExtrasDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingExtrasDialog({
  booking,
  isOpen,
  onOpenChange,
}: BookingExtrasDialogProps) {
  const updateExtrasMutation = useUpdateBookingExtras();

  const form = useForm<ExtrasFormValues>({
    resolver: zodResolver(extrasSchema) as Resolver<ExtrasFormValues>,
    defaultValues: { extras: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extras",
  });

  // Reset form when booking changes
  useEffect(() => {
    if (booking && isOpen) {
      form.reset({
        extras: booking.extras.map((e) => ({
          extraOptionId: e.extraOptionId || "",
          quantity: e.quantity,
        })),
      });
    }
  }, [booking, isOpen, form]);

  const onSubmit = (data: ExtrasFormValues) => {
    if (!booking) return;

    updateExtrasMutation.mutate(
      { id: booking.id, payload: data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const isSaving = updateExtrasMutation.isPending;

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Gestione Extra"
      description={`Gestisci i servizi aggiuntivi per la prenotazione di ${booking?.mainGuest.lastName}.`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto px-1">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-3 border p-3 rounded-md bg-muted/20"
              >
                <div className="flex-1 w-full">
                  <FormField
                    control={form.control}
                    name={`extras.${index}.extraOptionId`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-xs">Extra</FormLabel>
                        <FormControl>
                          <ExtraSelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Seleziona..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-20">
                  <FormField
                    control={form.control}
                    name={`extras.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Qtà</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground border-dashed border rounded-md">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessun extra selezionato</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => append({ extraOptionId: "", quantity: 1 })}
          >
            <Plus className="h-4 w-4" /> Aggiungi Extra
          </Button>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Salva
            </Button>
          </div>
        </form>
      </Form>
    </BaseDataDialog>
  );
}
