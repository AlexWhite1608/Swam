import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/schemas/bookingsSchema";
import { Clock, CheckCircle2, LogIn, LogOut, XCircle } from "lucide-react";

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  let badgeClass = "";
  let label = status;
  let Icon = Clock;

  switch (status) {
    case BookingStatus.PENDING:
      badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
      label = "In attesa";
      Icon = Clock;
      break;
    case BookingStatus.CONFIRMED:
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Confermata";
      Icon = CheckCircle2;
      break;
    case BookingStatus.CHECKED_IN:
      badgeClass = "bg-green-50 text-green-700 border-green-200";
      label = "Check-In";
      Icon = LogIn;
      break;
    case BookingStatus.CHECKED_OUT:
      badgeClass = "bg-gray-100 text-gray-600 border-gray-200";
      label = "Check-out";
      Icon = LogOut;
      break;
    case BookingStatus.CANCELLED:
      badgeClass = "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
      label = "Cancellata";
      Icon = XCircle;
      break;
    default:
      badgeClass = "";
      label = status;
  }

  return (
    <Badge variant="outline" className={`${badgeClass} flex items-center gap-1 w-fit`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}