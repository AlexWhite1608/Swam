import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/bookings/enums";
import { PaymentStatusType } from "@/types/bookings/types";
import {
  CheckCircle2,
  CircleDollarSign,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface PaymentStatusBadgeProps {
  status: PaymentStatusType | string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  let badgeClass = "";
  let label = status;
  let Icon = CircleDollarSign;

  switch (status) {
    case PaymentStatus.PAID_IN_FULL:
      badgeClass = "text-green-700 bg-green-50 border-green-200";
      label = "Saldato";
      Icon = CheckCircle2;
      break;
    case PaymentStatus.DEPOSIT_PAID:
      badgeClass = "text-orange-700 bg-orange-50 border-orange-200";
      label = "Acconto";
      Icon = CircleDollarSign;
      break;
    case PaymentStatus.REFUNDED:
      badgeClass = "text-gray-600 bg-gray-100 border-gray-200";
      label = "Rimborsato";
      Icon = RefreshCw;
      break;
    case PaymentStatus.UNPAID:
      badgeClass = "text-red-700 bg-red-50 border-red-200";
      label = "Non Saldato";
      Icon = XCircle;
      break;
    default:
      badgeClass = "";
      label = status;
  }

  return (
    <Badge
      variant="outline"
      className={`${badgeClass} flex items-center gap-1 w-fit`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
