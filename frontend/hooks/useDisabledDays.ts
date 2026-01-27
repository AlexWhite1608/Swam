import { parseISO, subDays } from "date-fns";

interface UnavailablePeriod {
  start: string;
  end: string;
}

// Hook to get disabled days for date picker
export function useDisabledDays(unavailablePeriods?: UnavailablePeriod[]) {
  // calculate occupied date matchers from unavailable periods
  const occupiedDatesMatchers = (unavailablePeriods || []).map((period) => ({
    from: parseISO(period.start),
    to: subDays(parseISO(period.end), 1),
  }));

  // all disabled dates include past dates and occupied periods
  const allDisabledDates = [{ before: new Date() }, ...occupiedDatesMatchers];

  return { occupiedDatesMatchers, allDisabledDates };
}
