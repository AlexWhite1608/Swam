import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/schemas/bookingsSchema";

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  let badgeClass = "";
  let label = status;

  switch (status) {
    case BookingStatus.PENDING:
      badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
      label = "In attesa";
      break;
    case BookingStatus.CONFIRMED:
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Confermata";
      break;
    case BookingStatus.CHECKED_IN:
      badgeClass = "bg-green-50 text-green-700 border-green-200";
      label = "Check-In";
      break;
    case BookingStatus.CHECKED_OUT:
      badgeClass = "bg-gray-100 text-gray-600 border-gray-200";
      label = "Check-out";
      break;
    case BookingStatus.CANCELLED:
      badgeClass = "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
      label = "Cancellata";
      break;
    default:
      badgeClass = "";
      label = status;
  }

  return (
    <Badge variant="outline" className={badgeClass}>
      {label}
    </Badge>
  );
}
