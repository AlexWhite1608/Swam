import * as React from "react";
import { Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ className, onChange, onBlur, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
      value = value.replace(/^0+/, "");
      e.target.value = value;
    }

    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value === "") {
      value = "0";
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      e.target.value = numericValue.toFixed(2);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="relative">
      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
      <Input
        type="number"
        step="0.01"
        min="0"
        className={cn("bg-background pl-8", className)}
        ref={ref}
        onChange={handleChange}
        onBlur={handleBlur}
        onWheel={(e) => e.currentTarget.blur()}
        clearable={false}
        {...props}
      />
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";