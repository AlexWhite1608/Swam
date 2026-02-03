"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
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
import { NAV_ITEMS } from "@/lib/navigation";
import { Booking } from "@/types/bookings/types";

//fixme: riordinare
const extendSchema = z.object({
  newCheckOut: z.date({ error: "" }),
  newResourceId: z.string().optional(),
});

const splitSchema = z.object({
  splitDate: z.date({ error: "" }),
  newResourceId: z.string().min(1, "Seleziona una nuova risorsa"),
});

interface EditStayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

type OperationMode = "extend" | "split"; // extend or change resource (split)

export function EditStayDialog({
  isOpen,
  onOpenChange,
  booking,
}: EditStayDialogProps) {
  const { data: resources, isLoading: isLoadingRes } = useResources();

  const extendSplitMutation = useExtendBookingWithSplit();
  const updateStayMutation = useUpdateStay();
  const splitMutation = useSplitBooking();

  const [mode, setMode] = useState<OperationMode>("extend");
  const [isConflict, setIsConflict] = useState(false);
  const [isNewResourceInvalid, setIsNewResourceInvalid] = useState(false);

  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  // extend booking form
  const extendForm = useForm<z.infer<typeof extendSchema>>({
    resolver: zodResolver(extendSchema),
    defaultValues: {
      newResourceId: "",
    },
  });

  // change resource (split) form
  const splitForm = useForm<z.infer<typeof splitSchema>>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      splitDate: undefined,
      newResourceId: "",
    },
  });

  // reset on open
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
      setIsConflict(false);
      setIsNewResourceInvalid(false);
      setMode("extend");
    }
  }, [isOpen, booking, extendForm, splitForm]);

  // === EXTEND MODE LOGIC ===
  const newCheckOut = extendForm.watch("newCheckOut");
  const extendResourceId = extendForm.watch("newResourceId");

  const assignedResource = resources?.find((r) => r.id === booking?.resourceId);

  // Determine which resource to check for extend mode
  const extendResourceToCheck =
    isConflict && extendResourceId ? extendResourceId : booking?.resourceId;

  const extendExcludeId =
    extendResourceToCheck === booking?.resourceId ? booking?.id : undefined;

  const { data: extendUnavailablePeriods } = useUnavailableDates(
    extendResourceToCheck,
    extendExcludeId,
  );

  const { occupiedDatesMatchers: extendOccupiedMatchers } = useDisabledDays(
    extendUnavailablePeriods,
  );

  // Get unavailable dates for current resource (conflict detection for extend)
  const { data: currentResourceUnavailable } = useUnavailableDates(
    booking?.resourceId,
    booking?.id,
  );

  // Conflict detection for extend mode
  useEffect(() => {
    if (
      mode !== "extend" ||
      !booking ||
      !newCheckOut ||
      !currentResourceUnavailable
    )
      return;

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

    if (!hasConflict && extendForm.getValues("newResourceId") !== "") {
      extendForm.setValue("newResourceId", "");
    }
  }, [mode, newCheckOut, currentResourceUnavailable, booking, extendForm]);

  // Validate new resource for extend mode
  useEffect(() => {
    if (
      mode !== "extend" ||
      !isConflict ||
      !extendResourceId ||
      !extendUnavailablePeriods ||
      !booking
    )
      return;

    const currentCheckOut = parseISO(booking.checkOut);

    const isBlocked = extendUnavailablePeriods.some((p) => {
      const busyStart = parseISO(p.start);
      return (
        isBefore(busyStart, newCheckOut) &&
        isAfter(parseISO(p.end), currentCheckOut)
      );
    });

    setIsNewResourceInvalid(isBlocked);
  }, [
    mode,
    isConflict,
    extendResourceId,
    extendUnavailablePeriods,
    newCheckOut,
    booking,
  ]);

  // === SPLIT MODE LOGIC ===
  const splitDate = splitForm.watch("splitDate");
  const splitResourceId = splitForm.watch("newResourceId");

  const { data: splitUnavailablePeriods } = useUnavailableDates(
    splitResourceId || undefined,
    undefined,
  );

  const { occupiedDatesMatchers: splitOccupiedMatchers } = useDisabledDays(
    splitUnavailablePeriods,
  );

  // Validate new resource for split mode
  const [isSplitResourceInvalid, setIsSplitResourceInvalid] = useState(false);

  useEffect(() => {
    if (
      mode !== "split" ||
      !splitDate ||
      !splitResourceId ||
      !splitUnavailablePeriods ||
      !booking
    ) {
      setIsSplitResourceInvalid(false);
      return;
    }

    const originalCheckOut = parseISO(booking.checkOut);

    const isBlocked = splitUnavailablePeriods.some((p) => {
      const busyStart = parseISO(p.start);
      const busyEnd = parseISO(p.end);
      return (
        isBefore(busyStart, originalCheckOut) && isAfter(busyEnd, splitDate)
      );
    });

    setIsSplitResourceInvalid(isBlocked);
  }, [mode, splitDate, splitResourceId, splitUnavailablePeriods, booking]);

  // === SUBMIT HANDLERS ===
  const onExtendSubmit = (values: z.infer<typeof extendSchema>) => {
    if (!booking) return;

    if (isNewResourceInvalid) return;

    if (isConflict) {
      if (!values.newResourceId) {
        extendForm.setError("newResourceId", {
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

  const onSplitSubmit = (values: z.infer<typeof splitSchema>) => {
    if (!booking) return;

    if (isSplitResourceInvalid) return;

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

  const fixedCheckIn = parseISO(booking.checkIn);
  const currentCheckOut = parseISO(booking.checkOut);
  const resourceToCheckForExtend = resources?.find(
    (r) => r.id === extendResourceToCheck,
  );
  const resourceToCheckForSplit = resources?.find(
    (r) => r.id === splitResourceId,
  );

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Modifica Soggiorno"
      className="sm:max-w-[550px]"
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
                {format(new Date(booking.checkIn), "d/MM/yyyy", { locale: it })}{" "}
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
                Risorsa: <strong>{assignedResource?.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs for operation mode */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as OperationMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extend">
              <CalendarPlus className="h-4 w-4 " />
              Modifica Date
            </TabsTrigger>
            <TabsTrigger value="split">
              <Split className="h-4 w-4 " />
              Cambia Risorsa
            </TabsTrigger>
          </TabsList>

          {/* EXTEND MODE */}
          <TabsContent value="extend" className="space-y-4 mt-2">
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
                        date={{
                          from: fixedCheckIn,
                          to: field.value,
                        }}
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

                {isConflict && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-amber-800">
                      <strong>{assignedResource?.name}</strong> è occupata nel
                      nuovo periodo selezionato. Scegli una risorsa alternativa
                      per completare la modifica del soggiorno.
                    </AlertDescription>
                  </Alert>
                )}

                {isConflict && (
                  <div className="space-y-3">
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

                    {extendResourceId && !isNewResourceInvalid && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">
                          <strong>{resourceToCheckForExtend?.name}</strong> è
                          libera per l&apos;intero periodo. Puoi procedere con
                          lo spostamento.
                        </AlertDescription>
                      </Alert>
                    )}

                    {isNewResourceInvalid && extendResourceId && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertDescription className="text-red-800">
                          <strong>{resourceToCheckForExtend?.name}</strong> non
                          è disponibile per il periodo indicato. Seleziona
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
                      (isConflict && !extendResourceId)
                    }
                  >
                    {isPending && <Loader2 className=" h-4 w-4 animate-spin" />}
                    {isConflict ? (
                      <>
                        <Split className="h-4 w-4 " /> Conferma Spostamento
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="h-4 w-4 " /> Modifica Soggiorno
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* SPLIT MODE */}
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
                  <div className="bg-muted/20 p-3 rounded-md space-y-2 text-sm border">
                    <p className="font-medium">Riepilogo:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>
                        • Parte 1:{" "}
                        <strong>{assignedResource?.name || "-"}</strong> fino al{" "}
                        {format(splitDate, "d/MM/yyyy", { locale: it })}
                      </li>
                      <li>
                        • Parte 2:{" "}
                        <strong>{resourceToCheckForSplit?.name || "-"}</strong>{" "}
                        dal {format(splitDate, "d/MM/yyyy", { locale: it })} al{" "}
                        {format(currentCheckOut, "d/MM/yyyy", { locale: it })}
                      </li>
                    </ul>
                  </div>
                )}

                {splitResourceId && !isSplitResourceInvalid && splitDate && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      <strong>{resourceToCheckForSplit?.name}</strong> è
                      disponibile per il periodo richiesto.
                    </AlertDescription>
                  </Alert>
                )}

                {isSplitResourceInvalid && splitResourceId && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-900">
                      Risorsa Occupata
                    </AlertTitle>
                    <AlertDescription className="text-red-800">
                      <strong>{resourceToCheckForSplit?.name}</strong> non è
                      disponibile per il periodo indicato. Seleziona
                      un&apos;altra risorsa o modifica la data.
                    </AlertDescription>
                  </Alert>
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
                      isSplitResourceInvalid
                    }
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Split className="h-4 w-4 " />
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
