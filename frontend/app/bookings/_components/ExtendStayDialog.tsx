"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
  Check,
  Loader2,
  Split,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResourceSelect } from "@/components/ui/resource-select";
import {
  useExtendBookingWithSplit,
  useUnavailableDates,
  useUpdateStay,
} from "@/hooks/tanstack-query/useBookings";
import { useResources } from "@/hooks/tanstack-query/useResources";
import { useDisabledDays } from "@/hooks/useDisabledDays";
import { NAV_ITEMS } from "@/lib/navigation";
import { Booking } from "@/types/bookings/types";

const extendSchema = z.object({
  newCheckOut: z.date({ error: "" }),
  newResourceId: z.string().optional(),
});

interface ExtendStayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function ExtendStayDialog({
  isOpen,
  onOpenChange,
  booking,
}: ExtendStayDialogProps) {
  const { data: resources, isLoading: isLoadingRes } = useResources();

  const extendSplitMutation = useExtendBookingWithSplit();
  const updateStayMutation = useUpdateStay();

  const [isConflict, setIsConflict] = useState(false);
  const [isNewResourceInvalid, setIsNewResourceInvalid] = useState(false);

  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  const form = useForm<z.infer<typeof extendSchema>>({
    resolver: zodResolver(extendSchema),
    defaultValues: {
      newResourceId: "",
    },
  });

  useEffect(() => {
    if (isOpen && booking) {
      form.reset({
        newCheckOut: parseISO(booking.checkOut),
        newResourceId: "",
      });
      setIsConflict(false);
      setIsNewResourceInvalid(false);
    }
  }, [isOpen, booking, form]);

  const newCheckOut = form.watch("newCheckOut");
  const newResourceId = form.watch("newResourceId");

  const assignedResource = resources?.find((r) => r.id === booking?.resourceId);

  // if there is a conflict and a new resource is selected, check the new one. Otherwise, check the current one.
  const resourceToCheck =
    isConflict && newResourceId ? newResourceId : booking?.resourceId;

  const resourceToCheckId = resources?.find((r) => r.id === resourceToCheck);

  // if i check current resource, exclude current booking id, if checking new resource, do not exclude anything
  const excludeId =
    resourceToCheck === booking?.resourceId ? booking?.id : undefined;

  const { data: unavailablePeriods } = useUnavailableDates(
    resourceToCheck,
    excludeId,
  );

  const { occupiedDatesMatchers } = useDisabledDays(unavailablePeriods);

  // get unavailable dates for the currently assigned resource (to detect conflicts)
  const { data: currentResourceUnavailable } = useUnavailableDates(
    booking?.resourceId,
    booking?.id,
  );

  // conflict detection logic
  useEffect(() => {
    if (!booking || !newCheckOut || !currentResourceUnavailable) return;

    const currentCheckOut = parseISO(booking.checkOut);

    if (!isAfter(newCheckOut, currentCheckOut)) {
      setIsConflict(false);
      return;
    }

    const hasConflict = currentResourceUnavailable.some((p) => {
      const busyStart = parseISO(p.start);
      return (
        isBefore(busyStart, newCheckOut) &&
        isAfter(parseISO(p.end), currentCheckOut)
      );
    });

    setIsConflict(hasConflict);

    if (!hasConflict) {
      if (form.getValues("newResourceId") !== "") {
        form.setValue("newResourceId", "");
      }
    }
  }, [newCheckOut, currentResourceUnavailable, booking, form]);

  // validate new resource if selected
  useEffect(() => {
    if (isConflict && newResourceId && unavailablePeriods && booking) {
      const currentCheckOut = parseISO(booking.checkOut);

      // check if new resource is also blocked
      const isBlocked = unavailablePeriods.some((p) => {
        const busyStart = parseISO(p.start);
        return (
          isBefore(busyStart, newCheckOut) &&
          isAfter(parseISO(p.end), currentCheckOut)
        );
      });

      setIsNewResourceInvalid(isBlocked);
    } else {
      setIsNewResourceInvalid(false);
    }
  }, [isConflict, newResourceId, unavailablePeriods, newCheckOut, booking]);

  const onSubmit = (values: z.infer<typeof extendSchema>) => {
    if (!booking) return;

    if (isNewResourceInvalid) return;

    if (isConflict) {
      if (!values.newResourceId) {
        form.setError("newResourceId", {
          message: "Selezionare una nuova risorsa libera",
        });
        return;
      }

      extendSplitMutation.mutate(
        {
          id: booking.id,
          payload: {
            newResourceId: values.newResourceId,
            newCheckOutDate: format(values.newCheckOut, "yyyy-MM-dd"),
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      updateStayMutation.mutate(
        {
          id: booking.id,
          payload: {
            resourceId: booking.resourceId,
            checkIn: booking.checkIn,
            checkOut: format(values.newCheckOut, "yyyy-MM-dd"),
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const isPending =
    extendSplitMutation.isPending || updateStayMutation.isPending;

  if (!booking) return null;

  const fixedCheckIn = parseISO(booking.checkIn);
  const currentCheckOut = parseISO(booking.checkOut);

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Estendi Soggiorno"
      className="sm:max-w-[500px]"
    >
      <div className="space-y-4">
        {/* Current booking info */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Prenotazione Attuale
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
                {format(fixedCheckIn, "d/MM/yyyy", { locale: it })} -{" "}
                {format(currentCheckOut, "d/MM/yyyy", { locale: it })}
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

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newCheckOut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Nuovo Periodo Soggiorno</FormLabel>
                  <DateRangePicker
                    buttonClassName="w-full h-9 border border-input hover:bg-background text-muted-foreground justify-start text-left"
                    occupiedDates={occupiedDatesMatchers}
                    disabledDates={(date) => isBefore(date, fixedCheckIn)}
                    date={{
                      from: fixedCheckIn,
                      to: field.value,
                    }}
                    setDate={(range) => {
                      const clickedDate = range?.to || range?.from;
                      if (clickedDate && isAfter(clickedDate, fixedCheckIn)) {
                        field.onChange(clickedDate);
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {isConflict && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">
                  <strong>{assignedResource?.name}</strong> è occupata nel nuovo
                  periodo selezionato. Scegli una risorsa alternativa per
                  completare l&apos;estensione.
                </AlertDescription>
              </Alert>
            )}

            {isConflict && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="newResourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuova Risorsa</FormLabel>
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

                {/* Success: new resource is available */}
                {newResourceId && !isNewResourceInvalid && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      <strong>{resourceToCheckId?.name}</strong> è libera per
                      l&apos;intero periodo. Puoi procedere con lo spostamento.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error: new resource is also occupied */}
                {isNewResourceInvalid && newResourceId && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-900">
                      Risorsa Occupata
                    </AlertTitle>
                    <AlertDescription className="text-red-800">
                      <strong>{resourceToCheckId?.name}</strong> non è
                      disponibile per il periodo indicato. Seleziona
                      un&apos;altra risorsa o modifica le date.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  isNewResourceInvalid ||
                  (isConflict && !newResourceId)
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isConflict ? (
                  <>
                    <Split className="h-4 w-4" /> Conferma Spostamento
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4" /> Estendi Soggiorno
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseDataDialog>
  );
}
