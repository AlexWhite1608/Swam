"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExtraOptions } from "@/hooks/tanstack-query/useExtraOptions";
import { formatCurrency } from "@/lib/utils";
import { ExtraOption } from "@/types/extras/types";
import { Loader2 } from "lucide-react";

interface ExtraSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ExtraSelect({
  value,
  onChange,
  placeholder = "Seleziona...",
  label = "Servizio",
  showLabel = true,
  disabled,
}: ExtraSelectProps) {
  const { data: availableExtras = [], isLoading } = useExtraOptions();

  if (isLoading) {
    return (
      <FormItem>
        {showLabel && <FormLabel className="text-xs">{label}</FormLabel>}
        <div className="flex items-center justify-center h-10 text-muted-foreground border rounded-md bg-muted/20">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-xs">Caricamento...</span>
        </div>
      </FormItem>
    );
  }

  return (
    <Select onValueChange={onChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} className="truncate" />
      </SelectTrigger>
      <SelectContent>
        {availableExtras
          .filter((opt: ExtraOption) => opt.active)
          .map((opt: ExtraOption) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name} ({formatCurrency(opt.defaultPrice)})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
