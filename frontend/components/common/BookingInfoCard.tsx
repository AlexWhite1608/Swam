import { useResource } from "@/hooks/tanstack-query/useResources";
import { NAV_ITEMS } from "@/lib/navigation";
import { Booking } from "@/types/bookings/types";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, User } from "lucide-react";

export function BookingInfoCard({ booking }: { booking: Booking }) {
  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  const { data: resource } = useResource(booking?.resourceId || "");

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Prenotazione Attuale
      </h4>
      <div className="bg-muted/20 p-3 rounded-md space-y-3 text-sm border">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold truncate">
            {booking.mainGuest.firstName} {booking.mainGuest.lastName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">
            {format(parseISO(booking.checkIn), "d/MM/yyyy", { locale: it })} -{" "}
            {format(parseISO(booking.checkOut), "d/MM/yyyy", { locale: it })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {ResourceIcon && (
            <ResourceIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">
            Risorsa: <strong>{resource?.name}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
