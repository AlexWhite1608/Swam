"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { AlertTriangle, CalendarPlus, Loader2, Split } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExtendBookingWithSplit,
  useSplitBooking,
  useUnavailableDates,
  useUpdateStay,
} from "@/hooks/tanstack-query/useBookings";
import { useResources } from "@/hooks/tanstack-query/useResources";
import { useDisabledDays } from "@/hooks/useDisabledDays";
import {
  ExtendFormValues,
  extendSchema,
  OperationMode,
  SplitFormValues,
  splitSchema,
} from "@/schemas/extendSplitSchema";
import { Booking } from "@/types/bookings/types";
import { BookingInfoCard } from "@/components/common/BookingInfoCard";
import { useConflictDetection } from "@/hooks/useConflictDetection";
import { useResourceValidation } from "@/hooks/useResourceValidation";
import { ResourceValidationAlert } from "@/components/common/ResourceValidationAlert";
import { toast } from "sonner";

export interface EditStayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCheckIn: (booking: Booking) => void;
  booking: Booking | null;
}

export function EditStayDialog({
  isOpen,
  onOpenChange,
  onOpenCheckIn,
  booking,
}: EditStayDialogProps) {
  const { data: resources, isLoading: isLoadingRes } = useResources();
  const [mode, setMode] = useState<OperationMode>("extend");

  // Mutations
  const extendSplitMutation = useExtendBookingWithSplit();
  const updateStayMutation = useUpdateStay();
  const splitMutation = useSplitBooking();

  // Forms
  const extendForm = useForm<ExtendFormValues>({
    resolver: zodResolver(extendSchema),
    defaultValues: {
      newCheckOut: undefined,
      newResourceId: "",
    },
  });

  const splitForm = useForm<SplitFormValues>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      splitDate: undefined,
      newResourceId: "",
    },
  });

  // Watch form values
  const newCheckOut = extendForm.watch("newCheckOut");
  const extendResourceId = extendForm.watch("newResourceId");
  const splitDate = splitForm.watch("splitDate");
  const splitResourceId = splitForm.watch("newResourceId");

  // Reset forms on open
  useEffect(() => {
    if (isOpen && booking) {
      extendForm.reset({
        newCheckOut: parseISO(booking.checkOut),
        newResourceId: "",
      });
      splitForm.reset({
        splitDate: undefined,
        newResourceId: "",
      });
      setMode("extend");
    }
  }, [isOpen, booking, extendForm, splitForm]);

  // Derived values
  const assignedResource = useMemo(
    () => resources?.find((r) => r.id === booking?.resourceId),
    [resources, booking?.resourceId],
  );

  const fixedCheckIn = booking ? parseISO(booking.checkIn) : new Date();
  const currentCheckOut = booking ? parseISO(booking.checkOut) : new Date();

  // === EXTEND MODE ===
  const { data: currentResourceUnavailable } = useUnavailableDates(
    booking?.resourceId,
    booking?.id,
  );

  const hasConflict = useConflictDetection(
    booking,
    newCheckOut,
    currentResourceUnavailable,
  );

  // Auto-clear resource selection when conflict is resolved
  useEffect(() => {
    if (mode === "extend" && !hasConflict && extendResourceId) {
      extendForm.setValue("newResourceId", "");
    }
  }, [mode, hasConflict, extendResourceId, extendForm]);

  const extendResourceToCheck =
    hasConflict && extendResourceId ? extendResourceId : booking?.resourceId;

  const extendExcludeId =
    extendResourceToCheck === booking?.resourceId ? booking?.id : undefined;

  const { data: extendUnavailablePeriods } = useUnavailableDates(
    extendResourceToCheck,
    extendExcludeId,
  );

  const { occupiedDatesMatchers: extendOccupiedMatchers } = useDisabledDays(
    extendUnavailablePeriods,
  );

  const isExtendResourceValid = useResourceValidation(
    "extend",
    booking,
    newCheckOut,
    extendResourceId,
    extendUnavailablePeriods,
  );

  const extendResourceToShow = resources?.find(
    (r) => r.id === extendResourceToCheck,
  );

  // === SPLIT MODE ===
  const { data: splitUnavailablePeriods } = useUnavailableDates(
    splitResourceId || undefined,
    undefined,
  );

  const { occupiedDatesMatchers: splitOccupiedMatchers } = useDisabledDays(
    splitUnavailablePeriods,
  );

  const isSplitResourceValid = useResourceValidation(
    "split",
    booking,
    splitDate,
    splitResourceId,
    splitUnavailablePeriods,
  );

  const splitResourceToShow = resources?.find((r) => r.id === splitResourceId);

  // === SUBMIT HANDLERS ===
  const onExtendSubmit = (values: ExtendFormValues) => {
    if (!booking) return;

    // Common success handler for both extend with and without split
    const handleSuccess = (updatedBooking: Booking) => {
      onOpenChange(false);

      toast.message("", {
        description:
          "É possibile aggiornare le date di permanenza degli ospiti.",
        duration: 8000,
        action: (
          <Button
            variant="default"
            onClick={() => {
              onOpenCheckIn(updatedBooking);
              toast.dismiss();
            }}
          >
            Vai al check-in
          </Button>
        ),
      });
    };

    if (hasConflict) {
      if (!values.newResourceId) {
        extendForm.setError("newResourceId", {
          message: "Seleziona una nuova risorsa",
        });
        return;
      }

      if (isExtendResourceValid === false) return;

      extendSplitMutation.mutate(
        {
          id: booking.id,
          payload: {
            newResourceId: values.newResourceId,
            newCheckOutDate: format(values.newCheckOut, "yyyy-MM-dd"),
          },
        },
        { onSuccess: (data) => handleSuccess(data) },
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
        { onSuccess: (data) => handleSuccess(data) },
      );
    }
  };

  const onSplitSubmit = (values: SplitFormValues) => {
    if (!booking || isSplitResourceValid === false) return;

    splitMutation.mutate(
      {
        id: booking.id,
        payload: {
          splitDate: format(values.splitDate, "yyyy-MM-dd"),
          newResourceId: values.newResourceId,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const isPending =
    extendSplitMutation.isPending ||
    updateStayMutation.isPending ||
    splitMutation.isPending;

  if (!booking) return null;

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Modifica Soggiorno"
      className="sm:max-w-[550px]"
    >
      <div className="space-y-4">
        {/* //fixme: aggiusta */}
        <BookingInfoCard
          booking={booking}
          newCheckOut={mode === "extend" ? newCheckOut : undefined}
          newResourceId={
            mode === "extend"
              ? hasConflict
                ? extendResourceId
                : undefined
              : splitResourceId
          }
        />

        <Tabs value={mode} onValueChange={(v) => setMode(v as OperationMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extend">
              <CalendarPlus className="h-4 w-4" />
              Modifica Date
            </TabsTrigger>
            <TabsTrigger value="split">
              <Split className="h-4 w-4" />
              Cambia Risorsa
            </TabsTrigger>
          </TabsList>

          {/* EXTEND TAB */}
          <TabsContent value="extend" className="space-y-4 mt-4">
            <Form {...extendForm}>
              <form
                onSubmit={extendForm.handleSubmit(onExtendSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={extendForm.control}
                  name="newCheckOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Nuovo Periodo Soggiorno</FormLabel>
                      <DateRangePicker
                        buttonClassName="w-full h-9 border border-input hover:bg-background text-muted-foreground justify-start text-left"
                        occupiedDates={extendOccupiedMatchers}
                        disabledDates={(date) => isBefore(date, fixedCheckIn)}
                        date={
                          field.value
                            ? { from: fixedCheckIn, to: field.value }
                            : undefined
                        }
                        setDate={(range) => {
                          const clickedDate = range?.to || range?.from;
                          if (
                            clickedDate &&
                            isAfter(clickedDate, fixedCheckIn)
                          ) {
                            field.onChange(clickedDate);
                          }
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasConflict && (
                  <>
                    <Alert className="bg-amber-50 border-amber-200">
                      <div className="flex gap-2">
                        <AlertDescription className="text-amber-800 text-sm">
                          <strong>{assignedResource?.name}</strong> è occupata
                          nel nuovo periodo. Seleziona una risorsa alternativa.
                        </AlertDescription>
                      </div>
                    </Alert>

                    <FormField
                      control={extendForm.control}
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

                    {extendResourceId && (
                      <ResourceValidationAlert
                        isValid={isExtendResourceValid}
                        resourceName={extendResourceToShow?.name}
                        type="extend"
                      />
                    )}
                  </>
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
                      !newCheckOut ||
                      (hasConflict && !extendResourceId) ||
                      isExtendResourceValid === false
                    }
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {hasConflict ? (
                      <>
                        <Split className="h-4 w-4" />
                        Conferma Spostamento
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="h-4 w-4" />
                        Modifica Soggiorno
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* SPLIT TAB */}
          <TabsContent value="split" className="space-y-4 mt-4">
            <Form {...splitForm}>
              <form
                onSubmit={splitForm.handleSubmit(onSplitSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={splitForm.control}
                  name="splitDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data di Cambio Risorsa</FormLabel>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleziona la data di cambio"
                        disabledDates={(date) =>
                          isBefore(date, fixedCheckIn) ||
                          !isBefore(date, currentCheckOut)
                        }
                        occupiedDates={splitOccupiedMatchers}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={splitForm.control}
                  name="newResourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuova Risorsa (dal cambio in poi)</FormLabel>
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

                {splitDate && splitResourceId && (
                  <>
                    <div className="bg-muted/20 p-3 rounded-md space-y-2 text-sm border">
                      <p className="font-medium">Riepilogo:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>
                          • Parte 1: <strong>{assignedResource?.name}</strong>{" "}
                          fino al{" "}
                          {format(splitDate, "d/MM/yyyy", { locale: it })}
                        </li>
                        <li>
                          • Parte 2:{" "}
                          <strong>{splitResourceToShow?.name}</strong> dal{" "}
                          {format(splitDate, "d/MM/yyyy", { locale: it })} al{" "}
                          {format(currentCheckOut, "d/MM/yyyy", { locale: it })}
                        </li>
                      </ul>
                    </div>

                    <ResourceValidationAlert
                      isValid={isSplitResourceValid}
                      resourceName={splitResourceToShow?.name}
                      type="split"
                    />
                  </>
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
                      !splitDate ||
                      !splitResourceId ||
                      isSplitResourceValid === false
                    }
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Split className="h-4 w-4" />
                    Conferma
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </BaseDataDialog>
  );
}
