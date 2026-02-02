// check-in/CheckInFormFooter.tsx
"use client";

import { Loader2, LogIn, Save } from "lucide-react";
import { Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";

interface BookingCheckInFormFooterProps {
  control: Control<CheckInFormValues>;
  isLoading?: boolean;
  isEditCheckIn?: boolean;
  onCancel: () => void;
}

export function BookingCheckInFormFooter({
  control,
  isLoading,
  isEditCheckIn,
  onCancel,
}: BookingCheckInFormFooterProps) {
  
  // Watch guestRole to disable button if SINGLE_GUEST
  const guestRole = useWatch({
    control,
    name: "guestRole",
  });

  const companions = useWatch({
    control,
    name: "companions",
  })?.length;

  return (
    <div className="pt-4 mt-2 border-t bg-background z-10">
      <div className="flex gap-3 items-end pb-2">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Eventuali note aggiuntive..."
                  className="resize-none text-sm"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading ||
              (guestRole === "SINGLE_GUEST" && (companions ?? 0) > 0)
            }
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditCheckIn ? (
              <Save className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isEditCheckIn ? "Salva" : "Check-in"}
          </Button>
        </div>
      </div>
    </div>
  );
}
