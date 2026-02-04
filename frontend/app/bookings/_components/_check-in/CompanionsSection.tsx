"use client";

import { Plus, Users, AlertCircle, Trash } from "lucide-react";
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";
import { CompanionCard } from "@/components/common/CompanionCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CompanionsSectionProps {
  control: Control<CheckInFormValues>;
  checkInDate: string;
  checkOutDate: string;
}

export function CompanionsSection({
  control,
  checkInDate,
  checkOutDate,
}: CompanionsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "companions",
  });

  // Watch guestRole to disable button if SINGLE_GUEST
  const guestRole = useWatch({
    control,
    name: "guestRole",
  });

  const isSingleGuest = guestRole === "SINGLE_GUEST";
  const hasCompanions = fields.length > 0;
  const showWarning = isSingleGuest && hasCompanions;

  const removeAllCompanions = () => {
    // Remove all companions in reverse order to avoid index issues
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
  };

  // get form values to set default arrival and departure dates for new companions
  const { getValues } = useFormContext<CheckInFormValues>();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">Altri Ospiti</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isSingleGuest}
          size="sm"
          onClick={() =>
            append({
              firstName: "",
              lastName: "",
              arrivalDate: new Date(checkInDate) || new Date(),
              departureDate: new Date(checkOutDate) || new Date(),
              sex: "M",
              birthDate: undefined,
              citizenship: getValues("citizenship") || "IT",
              placeOfBirth: "",
              guestType: "ADULT",
              guestRole: "MEMBER",
            })
          }
        >
          <Plus className="h-4 w-4" /> Aggiungi Ospite
        </Button>
      </div>

      {/* if there are guests and the role is "SINGLE_GUEST", remove guests */}
      {showWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attenzione</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Un ospite singolo non può avere accompagnatori. Rimuovi tutti gli
              ospiti per continuare.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeAllCompanions}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              Rimuovi Tutti
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <CompanionCard
            key={field.id}
            index={index}
            control={control}
            onRemove={() => remove(index)}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
          />
        ))}
        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg bg-muted/20">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessun ospite aggiuntivo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
