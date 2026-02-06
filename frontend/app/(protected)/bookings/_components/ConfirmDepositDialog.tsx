"use client";

import { Calendar, Check, Loader2, User } from "lucide-react";
import { useEffect } from "react";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUpdatePaymentStatus } from "@/hooks/tanstack-query/useBookings";
import { Booking } from "@/types/bookings/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useResource } from "@/hooks/tanstack-query/useResources";
import { NAV_ITEMS } from "@/lib/navigation";

interface ConfirmDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function ConfirmDepositDialog({
  isOpen,
  onOpenChange,
  booking,
}: ConfirmDepositDialogProps) {
  const updatePaymentMutation = useUpdatePaymentStatus();

  // fetch resource details
  const { data: resource } = useResource(booking?.resourceId || "");

  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  if (!booking) return null;

  const depositAmount = booking.priceBreakdown?.depositAmount || 0;

  const handleConfirm = () => {
    updatePaymentMutation.mutate(
      {
        id: booking.id,
        status: "DEPOSIT_PAID",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <BaseDataDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <span>Conferma Incasso Acconto</span>
        </div>
      }
      className="sm:max-w-[450px]"
    >
      <div className="space-y-4 py-2">
        {/* guest info */}
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
              {format(new Date(booking.checkIn), "d/MM/yyyy", { locale: it })} -{" "}
              {format(new Date(booking.checkOut), "d/MM/yyyy", { locale: it })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {ResourceIcon ? (
              <ResourceIcon className="h-4 w-4 text-muted-foreground" />
            ) : null}
            <span>
              Risorsa: <strong>{resource?.name}</strong>
            </span>
          </div>
        </div>

        <Separator />

        {/* deposit amount */}
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">Importo acconto:</span>
            </div>
            <span className="text-lg font-bold tracking-tight tabular-nums">
              € {depositAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePaymentMutation.isPending}
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={updatePaymentMutation.isPending}
          >
            {updatePaymentMutation.isPending && (
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
