import { parseISO, subDays } from "date-fns";

interface UnavailablePeriod {
  start: string;
  end: string;
}

// Hook to get disabled days for date picker
export function useDisabledDays(unavailablePeriods?: UnavailablePeriod[]) {
  return [
    { before: new Date() }, // always disable past dates
    ...(unavailablePeriods?.map((period) => ({
      from: parseISO(period.start),
      to: subDays(parseISO(period.end), 1),
    })) || []),
  ];
}
