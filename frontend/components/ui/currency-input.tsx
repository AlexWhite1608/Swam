import * as React from "react";
import { Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  className?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ className, value, onChange, onBlur, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState<string>("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Update display value when external value changes
  React.useEffect(() => {
    if (value !== undefined && value !== null && !isFocused) {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        setDisplayValue(numValue.toFixed(2));
      } else {
        setDisplayValue("");
      }
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Select all text on focus
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Allow empty string
    if (inputValue === "") {
      setDisplayValue("");
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: "",
            valueAsNumber: 0,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      return;
    }

    // Remove leading zeros except for decimal cases like "0.5"
    if (
      inputValue.startsWith("0") &&
      inputValue.length > 1 &&
      inputValue[1] !== "."
    ) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    setDisplayValue(inputValue);

    if (onChange) {
      const numValue = parseFloat(inputValue);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: inputValue,
          valueAsNumber: isNaN(numValue) ? 0 : numValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let inputValue = e.target.value;

    // If empty, set to empty string
    if (inputValue === "") {
      setDisplayValue("");
      if (onBlur) {
        onBlur(e);
      }
      return;
    }

    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      const formatted = numericValue.toFixed(2);
      setDisplayValue(formatted);

      // Update the actual input value
      e.target.value = formatted;
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
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onWheel={(e) => e.currentTarget.blur()}
        clearable={false}
        {...props}
      />
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";
