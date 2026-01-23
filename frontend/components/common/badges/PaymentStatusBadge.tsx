import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/schemas/bookingsSchema";

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  let badgeClass = "";
  let label = status;

  switch (status) {
    case PaymentStatus.PAID_IN_FULL:
      badgeClass = "text-green-700 bg-green-50 border-green-200";
      label = "Saldato";
      break;
    case PaymentStatus.DEPOSIT_PAID:
      badgeClass = "text-orange-700 bg-orange-50 border-orange-200";
      label = "Acconto";
      break;
    case PaymentStatus.REFUNDED:
      badgeClass = "text-gray-600 bg-gray-100 border-gray-200";
      label = "Rimborsato";
      break;
    case PaymentStatus.UNPAID:
      badgeClass = "text-red-700 bg-red-50 border-red-200";
      label = "Non Pagato";
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
