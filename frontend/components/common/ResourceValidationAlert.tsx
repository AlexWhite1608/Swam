import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function ResourceValidationAlert({
  isValid,
  resourceName,
  type,
}: {
  isValid: boolean | null;
  resourceName?: string;
  type: "extend" | "split";
}) {
  if (isValid === null || !resourceName) return null;

  if (isValid) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800 text-sm">
          <strong>{resourceName}</strong> è disponibile per il periodo
          richiesto.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertDescription className="text-red-800 text-sm">
        <strong>{resourceName}</strong> non è disponibile per il periodo
        indicato. Seleziona un&apos;altra risorsa
        {type === "extend" ? " o modifica le date" : " o modifica la data"}.
      </AlertDescription>
    </Alert>
  );
}
