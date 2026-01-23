import { Badge } from "@/components/ui/badge";
import { ResourceStatus, statusOptions } from "@/schemas/resourcesSchema";

interface ResourceStatusBadgeProps {
  status: ResourceStatus | string;
}

export function ResourceStatusBadge({ status }: ResourceStatusBadgeProps) {
  const statusObj = statusOptions.find((s) => s.value === status);
  if (!statusObj) return null;

  let badgeClass = "";

  if (status === ResourceStatus.AVAILABLE) {
    badgeClass =
      "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
  } else if (status === ResourceStatus.MAINTENANCE) {
    badgeClass =
      "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
  } else if (status === ResourceStatus.OUT_OF_ORDER) {
    badgeClass = "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
  }

  const Icon = statusObj.icon;

  return (
    <Badge variant="outline" className={badgeClass + " flex items-center gap-1"}>
      <Icon className="h-4 w-4 mr-1" />
      {statusObj.label}
    </Badge>
  );
}