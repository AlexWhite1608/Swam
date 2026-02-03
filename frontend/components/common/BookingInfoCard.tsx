import { useResource } from "@/hooks/tanstack-query/useResources";
import { NAV_ITEMS } from "@/lib/navigation";
import { Booking } from "@/types/bookings/types";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowRight, Calendar, User } from "lucide-react";

interface BookingInfoCardProps {
  booking: Booking;
  newCheckOut?: Date;
  newResourceId?: string;
}

export function BookingInfoCard({
  booking,
  newCheckOut,
  newResourceId,
}: BookingInfoCardProps) {
  const ResourceIcon = NAV_ITEMS.find(
    (item) => item.href === "/resources",
  )?.icon;

  const { data: resource } = useResource(booking?.resourceId || "");
  const { data: newResource } = useResource(newResourceId || "");

  const hasDateChange =
    newCheckOut &&
    format(parseISO(booking.checkOut), "yyyy-MM-dd") !==
      format(newCheckOut, "yyyy-MM-dd");
  const hasResourceChange =
    newResourceId && newResourceId !== booking.resourceId;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Prenotazione{" "}
        {(hasDateChange || hasResourceChange) && "- Anteprima Modifiche"}
      </h4>
      <div className="bg-muted/20 p-3 rounded-md space-y-3 text-sm border">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold truncate">
            {booking.mainGuest.firstName} {booking.mainGuest.lastName}
          </span>
        </div>

        {/* updated dates */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            <span className="truncate">
              {format(parseISO(booking.checkIn), "d/MM/yyyy", { locale: it })} -{" "}
              <span
                className={
                  hasDateChange ? "line-through text-muted-foreground" : ""
                }
              >
                {format(parseISO(booking.checkOut), "d/MM/yyyy", {
                  locale: it,
                })}
              </span>
            </span>
            {hasDateChange && (
              <>
                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                <span className="font-semibold text-primary truncate">
                  {format(newCheckOut, "d/MM/yyyy", { locale: it })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* updated resource */}
        <div className="flex items-center gap-2">
          {ResourceIcon && (
            <ResourceIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            <span className="truncate">
              Risorsa:{" "}
              <strong
                className={
                  hasResourceChange
                    ? "line-through text-muted-foreground font-normal"
                    : ""
                }
              >
                {resource?.name}
              </strong>
            </span>
            {hasResourceChange && (
              <>
                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                <strong className="text-primary truncate">
                  {newResource?.name}
                </strong>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
