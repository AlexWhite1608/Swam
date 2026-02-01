"use client";

import { BookingDialogMode } from "@/hooks/pages/useBookingPage";
import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { BookingForm } from "./BookingForm";
import { BookingStatus } from "@/types/bookings/enums";
import { Booking } from "@/types/bookings/types";
import { BookingCheckInForm } from "./_check-in/BookingCheckInForm";
import { BookingCheckInHeader } from "./_check-in/BookingCheckInHeader";
import { useCheckInBooking, useUpdateBookingCheckIn } from "@/hooks/tanstack-query/useBookings";
import { format } from "date-fns";

const ReadOnlyView = ({ booking }: { booking: Booking }) => (
  <div className="p-4 bg-gray-100 text-gray-800 rounded">
    Vista dettagli (Sola lettura o correzioni amministrative).
  </div>
);

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BookingDialogMode;
  booking: Booking | null;
}

export function BookingDialog({
  open,
  onOpenChange,
  mode,
  booking,
}: BookingDialogProps) {
  const checkInMutation = useCheckInBooking();
  const updateCheckInMutation = useUpdateBookingCheckIn();

  const getConfig = () => {
    switch (mode) {
      case "CREATE":
        return {
          title: "Nuova Prenotazione",
          description:
            "Seleziona una risorsa per scegliere il periodo del soggiorno.",
          className: "sm:max-w-[600px]",
        };
      case "CHECKIN":
        return {
          title: booking ? (
            <BookingCheckInHeader booking={booking} />
          ) : (
            "Modifica Check-in" // fixme: riusa l'header cambiando il titolo
          ),
          description: undefined,
          className: "sm:max-w-[800px]",
        };
      case "CHECKOUT":
        return {
          title: "Check-out e Saldo",
          description: "Riepilogo extra e pagamento finale.",
          className: "sm:max-w-[600px]",
        };
      case "EDIT":
        return {
          title: `Modifica Prenotazione`,
          description: booking
            ? `Gestione prenotazione per ${booking.mainGuest.lastName} ${booking.mainGuest.firstName} `
            : "Modifica dati",
          className:
            booking?.status === BookingStatus.CHECKED_IN
              ? "sm:max-w-[800px]"
              : "sm:max-w-[600px]",
        };
      default:
        return { title: "", description: "", className: "" };
    }
  };

  const config = getConfig();

  const renderContent = () => {
    switch (mode) {
      case "CREATE":
        return (
          <BookingForm
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        );

      case "EDIT":
        if (!booking) return null;

        if (
          booking.status === BookingStatus.PENDING ||
          booking.status === BookingStatus.CONFIRMED
        ) {
          return (
            <BookingForm
              booking={booking}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          );
        }

        if (booking.status === BookingStatus.CHECKED_IN) {
          // edit during check-in uses the check-in form but updates via mutation
          return (
            <BookingCheckInForm
              booking={booking}
              isLoading={updateCheckInMutation.isPending}
              onCancel={() => onOpenChange(false)}
              onSubmit={(formData) => {
                if (!formData.birthDate) return;

                const validCompanions = formData.companions?.filter(
                  (c) => c.birthDate !== undefined,
                );

                const payload = {
                  ...formData,
                  birthDate: format(formData.birthDate, "yyyy-MM-dd"),
                  companions: validCompanions?.map((companion) => ({
                    ...companion,
                    birthDate: format(companion.birthDate!, "yyyy-MM-dd"),
                  })),
                };

                updateCheckInMutation.mutate(
                  { id: booking.id, payload },
                  {
                    onSuccess: () => onOpenChange(false),
                  },
                );
              }}
            />
          );
        }

        return <ReadOnlyView booking={booking} />;

      case "CHECKIN":
        if (!booking) return null;

        return (
          <BookingCheckInForm
            booking={booking}
            isLoading={checkInMutation.isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={(formData) => {
              if (!formData.birthDate) {
                return;
              }

              // Filter companions with valid birthdates
              const validCompanions = formData.companions?.filter(
                (c) => c.birthDate !== undefined,
              );

              const payload = {
                ...formData,
                birthDate: format(formData.birthDate, "yyyy-MM-dd"),
                companions: validCompanions?.map((companion) => ({
                  ...companion,
                  birthDate: format(companion.birthDate!, "yyyy-MM-dd"),
                })),
              };

              checkInMutation.mutate(
                { id: booking.id, payload },
                {
                  onSuccess: () => {
                    onOpenChange(false);
                  },
                },
              );
            }}
          />
        );

      case "CHECKOUT":
        return <div className="p-4">Wizard Check-out (Da implementare)</div>;

      default:
        return null;
    }
  };

  return (
    <BaseDataDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      title={config.title}
      description={config.description}
      className={config.className}
    >
      {renderContent()}
    </BaseDataDialog>
  );
}
