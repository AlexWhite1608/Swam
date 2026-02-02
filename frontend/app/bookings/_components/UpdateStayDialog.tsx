"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Calendar, Loader2, Save, User } from "lucide-react";

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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ResourceSelect } from "@/components/ui/resource-select";
import {
  useUpdateStay,
  useUnavailableDates,
} from "@/hooks/tanstack-query/useBookings";
import { useResources } from "@/hooks/tanstack-query/useResources";
import { useDisabledDays } from "@/hooks/useDisabledDays";
import { Booking } from "@/types/bookings/types";
import { NAV_ITEMS } from "@/lib/navigation";
import { it } from "date-fns/locale";

//fixme: sposta in file  Schema di validazione locale
const updateStaySchema = z.object({
  resourceId: z.string().min(1, ""),
  checkIn: z.date({ error: "" }),
  checkOut: z.date({ error: "" }),
});

type UpdateStayFormValues = z.infer<typeof updateStaySchema>;

interface UpdateStayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function UpdateStayDialog({
  isOpen,
  onOpenChange,
  booking,
}: UpdateStayDialogProps) {
  const updateStayMutation = useUpdateStay();
  const { data: resources, isLoading: isLoadingRes } = useResources();

  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  const form = useForm<UpdateStayFormValues>({
    resolver: zodResolver(updateStaySchema),
    defaultValues: {
      resourceId: "",
      checkIn: undefined,
      checkOut: undefined,
    },
  });

  // reset + starting values when dialog opens
  useEffect(() => {
    if (isOpen && booking) {
      form.reset({
        resourceId: booking.resourceId,
        checkIn: parseISO(booking.checkIn),
        checkOut: parseISO(booking.checkOut),
      });
    }
  }, [isOpen, booking, form]);

  // manage unavailable dates based on selected resource
  const selectedResourceId = form.watch("resourceId");
  const { data: unavailablePeriods } = useUnavailableDates(
    selectedResourceId,
    booking?.id, // exclude current booking to allow same dates
  );
  const { occupiedDatesMatchers, allDisabledDates } =
    useDisabledDays(unavailablePeriods);

  const onSubmit = (values: UpdateStayFormValues) => {
    if (!booking) return;

    updateStayMutation.mutate(
      {
        id: booking.id,
        payload: {
          resourceId: values.resourceId,
          checkIn: format(values.checkIn, "yyyy-MM-dd"),
          checkOut: format(values.checkOut, "yyyy-MM-dd"),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  if (!booking) return null;

  // Extract assigned resource from resources list
  const assignedResource = resources?.find((r) => r.id === booking.resourceId);

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Modifica Soggiorno"
      className="sm:max-w-[600px]"
    >
      <div className="space-y-4">
        {/* Current booking info */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dati Attuali
          </h4>
          <div className="bg-muted/20 p-3 rounded-md space-y-3 text-sm border">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {booking.mainGuest.firstName} {booking.mainGuest.lastName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(booking.checkIn), "d/MM/yyyy", {
                  locale: it,
                })}{" "}
                -{" "}
                {format(new Date(booking.checkOut), "d/MM/yyyy", {
                  locale: it,
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {ResourceIcon ? (
                <ResourceIcon className="h-4 w-4 text-muted-foreground" />
              ) : null}
              <span>
                Risorsa: <strong>{assignedResource?.name || "-"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Form for new data */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nuovi Dati
          </h4>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2"
            >
              <div className="grid grid-cols-2 gap-4">
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
                          isLoading={isLoadingRes}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkIn"
                  render={() => (
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
                          if (range?.from) form.setValue("checkIn", range.from);
                          if (range?.to) form.setValue("checkOut", range.to);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={updateStayMutation.isPending}>
                  {updateStayMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4" />
                  Salva
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BaseDataDialog>
  );
}