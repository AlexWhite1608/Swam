import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "@/lib/utils";

interface FlagComponentProps extends RPNInput.FlagProps {
  className?: string;
}

export const FlagComponent = ({
  country,
  countryName,
  className,
}: FlagComponentProps) => {
  const Flag = flags[country];

  return (
    <span
      className={cn(
        "flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full",
        className,
      )}
    >
      {Flag && <Flag title={countryName} />}
    </span>
  );
};