import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Caricamento..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
