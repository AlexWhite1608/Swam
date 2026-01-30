"use client";

import { Plus, Users } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";
import { CompanionCard } from "@/components/common/CompanionCard";

interface CompanionsSectionProps {
  control: Control<CheckInFormValues>;
}

export function CompanionsSection({ control }: CompanionsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "companions",
  });

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
          size="sm"
          onClick={() =>
            append({
              firstName: "",
              lastName: "",
              sex: "M",
              birthDate: undefined,
              citizenship: "IT", //FIXME: dovrebbe essere di partenza la stessa cittadinanza del main guest
              guestType: "ADULT",
              guestRole: "MEMBER",
            })
          }
        >
          <Plus className="h-4 w-4" /> Aggiungi Ospite
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <CompanionCard
            key={field.id}
            index={index}
            control={control}
            onRemove={() => remove(index)}
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
