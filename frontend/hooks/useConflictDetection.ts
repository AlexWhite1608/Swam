import { Booking } from "@/types/bookings/types";
import { isAfter, isBefore, parseISO } from "date-fns";
import { useMemo } from "react";

// Custom hook for conflict detection (extend mode only)
export function useConflictDetection(
  booking: Booking | null,
  newCheckOut: Date | undefined,
  currentResourceUnavailable: Array<{ start: string; end: string }> | undefined,
) {
  return useMemo(() => {
    if (!booking || !newCheckOut || !currentResourceUnavailable) {
      return false;
    }

    const currentCheckOut = parseISO(booking.checkOut);

    // No conflict if not extending
    if (!isAfter(newCheckOut, currentCheckOut)) {
      return false;
    }

    return currentResourceUnavailable.some((p) => {
      const busyStart = parseISO(p.start);
      const busyEnd = parseISO(p.end);
      return (
        isBefore(busyStart, newCheckOut) && isAfter(busyEnd, currentCheckOut)
      );
    });
  }, [booking, newCheckOut, currentResourceUnavailable]);
}
