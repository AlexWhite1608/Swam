import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-primary text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text- mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
