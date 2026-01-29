"use client";

import { BookingDialogMode } from "@/hooks/pages/useBookingPage";
import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { BookingForm } from "./BookingForm";
import { BookingStatus } from "@/types/bookings/enums";
import { Booking } from "@/types/bookings/types";

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
          title: "Check-in Ospite",
          description: "Registrazione documenti e dati anagrafici completi.",
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
          // if checked-in, larger dialog for more complex edit form
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

  // content renderer
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
          // simple edit form for pending/confirmed bookings
          return (
            <BookingForm
              booking={booking}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          );
        }

        if (booking.status === BookingStatus.CHECKED_IN) {
          // full edit form for checked-in bookings
          return <FullEditForm booking={booking} />;
        }

        // checkout or other statuses - read-only view and small admin corrections
        return <ReadOnlyView booking={booking} />;

      case "CHECKIN":
        return <div className="p-4">Wizard Check-in (Da implementare)</div>;

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
