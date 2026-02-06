"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BookingInfoCard } from "@/components/common/BookingInfoCard";
import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useConfirmBooking } from "@/hooks/tanstack-query/useBookings";
import { PaymentStatus } from "@/types/bookings/enums";
import { Booking } from "@/types/bookings/types";

interface ConfirmBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function ConfirmBookingDialog({
  isOpen,
  onOpenChange,
  booking,
}: ConfirmBookingDialogProps) {
  const confirmMutation = useConfirmBooking();
  const [hasPaidDeposit, setHasPaidDeposit] = useState(false);

  // reset state when dialog opens and booking changes
  useEffect(() => {
    if (isOpen) {
      setHasPaidDeposit(false);
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const depositAmount = booking.priceBreakdown?.depositAmount || 0;
  const hasDeposit = depositAmount > 0;
  const hasAlreadyPaidDeposit =
    booking.paymentStatus === PaymentStatus.DEPOSIT_PAID ||
    booking.paymentStatus === PaymentStatus.PAID_IN_FULL;

  const handleConfirm = () => {
    confirmMutation.mutate(
      {
        id: booking.id,
        hasPaidDeposit: hasDeposit ? hasPaidDeposit : false, // if no deposit, set to false
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Conferma Prenotazione"
      description="Verifica i dettagli prima di confermare la prenotazione."
      className="sm:max-w-[450px]"
    >
      <div className="space-y-4 py-2">
        {/* info recap */}
        <BookingInfoCard booking={booking} />

        <Separator />

        {/* has to pay deposit AND not already paid */}
        {hasDeposit && !hasAlreadyPaidDeposit && (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 transition-all">
            {/* amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-medium">Acconto richiesto:</span>
              </div>
              <span className="text-lg font-bold tracking-tight tabular-nums">
                € {depositAmount.toFixed(2)}
              </span>
            </div>

            <Separator />

            {/* deposit confirmation */}
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="deposit-paid"
                checked={hasPaidDeposit}
                onCheckedChange={(c) => setHasPaidDeposit(!!c)}
                className="h-5 w-5"
              />
              <Label
                htmlFor="deposit-paid"
                className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Conferma incasso acconto
              </Label>
            </div>
          </div>
        )}

        {/* no deposit */}
        {!hasDeposit && !hasAlreadyPaidDeposit && (
          <div className="rounded-lg border p-4 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Nessun acconto richiesto</p>
                <p className="text-xs text-muted-foreground">
                  La prenotazione verrà confermata immediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* already paid deposit */}
        {hasAlreadyPaidDeposit && (
          <div className="rounded-lg border p-4 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Acconto già saldato</p>
                <p className="text-xs text-muted-foreground">
                  La prenotazione verrà confermata immediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={confirmMutation.isPending}>
            {confirmMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <Check className="h-4 w-4" />
            Conferma
          </Button>
        </div>
      </div>
    </BaseDataDialog>
  );
}
