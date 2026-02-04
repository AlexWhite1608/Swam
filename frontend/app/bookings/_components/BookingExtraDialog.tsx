"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Button } from "@/components/ui/button";
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
import { useUpdateBookingExtras } from "@/hooks/tanstack-query/useBookings";
import { useExtraOptions } from "@/hooks/tanstack-query/useExtraOptions";
import { formatCurrency } from "@/lib/utils";
import { Booking } from "@/types/bookings/types";
import { ExtraOption } from "@/types/extras/types";

// fixme: sposta
const extrasSchema = z.object({
  extras: z.array(
    z.object({
      extraOptionId: z.string().min(1, "Seleziona un servizio"),
      quantity: z.coerce.number().min(1, "Minimo 1"),
    }),
  ),
});

type ExtrasFormValues = z.infer<typeof extrasSchema>;

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
  const { data: availableExtras = [], isLoading: isLoadingExtras } =
    useExtraOptions();
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
            {isLoadingExtras ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Caricamento
                listino...
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-3 border p-3 rounded-md bg-muted/20"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`extras.${index}.extraOptionId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Servizio</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableExtras
                                .filter((opt: ExtraOption) => opt.isActive)
                                .map((opt: ExtraOption) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name} (
                                    {formatCurrency(opt.defaultPrice)})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
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
                          <FormLabel className="text-xs">Qta</FormLabel>
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
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            {fields.length === 0 && !isLoadingExtras && (
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
            disabled={isLoadingExtras}
          >
            <Plus className="h-4 w-4 mr-2" /> Aggiungi Extra
          </Button>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salva Modifiche
            </Button>
          </div>
        </form>
      </Form>
    </BaseDataDialog>
  );
}
