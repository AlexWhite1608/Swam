import { Badge } from "@/components/ui/badge";
import { ResourceStatus } from "@/types/resources/enums";
import { resourceStatusOptions } from "@/types/resources/options";
import { ResourceStatusType } from "@/types/resources/types";

interface ResourceStatusBadgeProps {
  status: ResourceStatusType | string;
  showIcon?: boolean;
}

export function ResourceStatusBadge({
  status,
  showIcon = true,
}: ResourceStatusBadgeProps) {
  const statusObj = resourceStatusOptions.find((s) => s.value === status);
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
    <Badge
      variant="outline"
      className={badgeClass + " flex items-center gap-1"}
    >
      {showIcon && Icon && <Icon className="h-4 w-4" />}
      {statusObj.label}
    </Badge>
  );
}
