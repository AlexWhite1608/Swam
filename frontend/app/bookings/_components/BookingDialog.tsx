"use client";

import { BookingDialogMode } from "@/hooks/pages/useBookingPage";
import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { BookingForm } from "./BookingForm";
import { BookingStatus } from "@/types/bookings/enums";
import { Booking } from "@/types/bookings/types";
import { BookingCheckInForm } from "./_check-in/BookingCheckInForm";
import { BookingCheckInHeader } from "./_check-in/BookingCheckInHeader";
import { useCheckInBooking } from "@/hooks/tanstack-query/useBookings";
import { format } from "date-fns";

//FIXME: Placeholder per i form futuri
const FullEditForm = ({ booking }: { booking: Booking }) => (
  <div className="p-4 bg-purple-50 text-purple-800 rounded">
    Form di modifica "Full" per {booking.mainGuest.lastName} (Stato:{" "}
    {booking.status})
    <br />
    Tabs: Anagrafica Completa, Documenti, Extra, Estensione Soggiorno.
  </div>
);

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
          title: booking ? <BookingCheckInHeader booking={booking} /> : "Check-in Ospite",
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
          return <FullEditForm booking={booking} />;
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
                (c) => c.birthDate !== undefined
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
                }
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