"use client";

import { BookingStatusBadge } from "@/components/common/badges/BookingStatusBadge";
import { PaymentStatusBadge } from "@/components/common/badges/PaymentStatusBadge";
import { useResource } from "@/hooks/tanstack-query/useResources";
import { Booking } from "@/types/bookings/types";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

interface BookingCheckInHeaderProps {
  booking: Booking;
}

export function BookingCheckInHeader({ booking }: BookingCheckInHeaderProps) {
  const { data: resource } = useResource(booking.resourceId);

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: it });
  };

  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">
          Check-in {booking.mainGuest.lastName} {booking.mainGuest.firstName}
        </h3>
        <span className="text-xs text-muted-foreground">
          {resource?.name} • {formatDate(booking.checkIn)} -{" "}
          {formatDate(booking.checkOut)}
        </span>
      </div>
      <div className="flex gap-2 mb-4 ml-4">
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.paymentStatus} />
      </div>
    </div>
  );
}