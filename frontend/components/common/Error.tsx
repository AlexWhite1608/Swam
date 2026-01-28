import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function Error({
  title = "Si è verificato un errore",
  message = "Non è stato possibile caricare i dati.",
  onRetry,
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="rounded-full bg-destructive/10 p-6 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          <RotateCw className="h-4 w-4" />
          Riprova
        </Button>
      )}
    </div>
  );
}
