"use client";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { BookingDialogMode } from "@/hooks/pages/useBookingPage";
import { Booking } from "@/schemas/bookingsSchema";
import { BookingForm } from "./BookingForm";

const CheckInForm = () => (
  <div className="p-4 text-sm text-muted-foreground">
    Form Check-in (In arrivo...)
  </div>
);
const CheckOutForm = () => (
  <div className="p-4 text-sm text-muted-foreground">
    Form Check-out (In arrivo...)
  </div>
);
const EditBookingForm = () => (
  <div className="p-4 text-sm text-muted-foreground">
    Form Edit Completo (In arrivo...)
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
            "Inserimento informazioni di base per la nuova prenotazione.",
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
          description: "Aggiorna i dettagli della prenotazione esistente.",
          className: "sm:max-w-[600px]",
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
      case "CHECKIN":
        // return <CheckInForm booking={booking} onSuccess={...} />;
        return <CheckInForm />;
      case "CHECKOUT":
        // return <CheckOutForm booking={booking} onSuccess={...} />;
        return <CheckOutForm />;
      case "EDIT":
        // return <EditBookingForm booking={booking} onSuccess={...} />;
        return <EditBookingForm />;
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
