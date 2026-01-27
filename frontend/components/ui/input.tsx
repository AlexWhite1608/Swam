import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  clearable?: boolean
  onClear?: () => void
}

function Input({ className, type, clearable, onClear, onChange, ...props }: InputProps) {
  const ref = React.useRef<HTMLInputElement | null>(null)

  const handleClear = () => {
    if (ref.current) {
      ref.current.value = ""
      const ev = { target: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>
      if (onChange) onChange(ev)
    }
    if (onClear) onClear()
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          clearable && "pr-8",
          className
        )}
        onChange={onChange}
        {...props}
      />
      {clearable && ref.current?.value &&  (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { Input }