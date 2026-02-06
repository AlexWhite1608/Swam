import { OperationMode } from "@/schemas/extendSplitSchema";
import { Booking } from "@/types/bookings/types";
import { parseISO, isAfter, isBefore } from "date-fns";
import { useMemo } from "react";

// Custom hook for resource validation logic
export function useResourceValidation(
  mode: OperationMode,
  booking: Booking | null,
  newDate: Date | undefined,
  resourceId: string | undefined,
  unavailablePeriods: Array<{ start: string; end: string }> | undefined,
) {
  return useMemo(() => {
    if (!booking || !newDate || !resourceId || !unavailablePeriods) {
      return null;
    }

    const checkOut = parseISO(booking.checkOut);

    const isBlocked = unavailablePeriods.some((p) => {
      const busyStart = parseISO(p.start);
      const busyEnd = parseISO(p.end);

      if (mode === "extend") {
        return isBefore(busyStart, newDate) && isAfter(busyEnd, checkOut);
      } else {
        // split mode
        return isBefore(busyStart, checkOut) && isAfter(busyEnd, newDate);
      }
    });

    return !isBlocked;
  }, [mode, booking, newDate, resourceId, unavailablePeriods]);
}
