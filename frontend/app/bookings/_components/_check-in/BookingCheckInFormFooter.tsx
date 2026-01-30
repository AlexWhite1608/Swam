// check-in/CheckInFormFooter.tsx
"use client";

import { Loader2 } from "lucide-react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { CheckInFormValues } from "@/schemas/mainGuestCheckInSchema";

interface BookingCheckInFormFooterProps {
  control: Control<CheckInFormValues>;
  isLoading?: boolean;
  onCancel: () => void;
}

export function BookingCheckInFormFooter({
  control,
  isLoading,
  onCancel,
}: BookingCheckInFormFooterProps) {
  return (
    <div className="pt-4 mt-2 border-t bg-background z-10">
      <div className="flex gap-3 items-start pb-2">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Note check-in..."
                  className="h-9 resize-none text-sm"
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
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
