// BaseDataDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface BaseDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * BaseDataDialog is a reusable dialog component that displays a modal window with a customizable title,
 * optional description, and content area for child components. It leverages the Dialog UI primitives
 * and provides control over its open state and appearance.
 *
 * @param isOpen - Boolean indicating whether the dialog is open.
 * @param onOpenChange - Callback function triggered when the dialog's open state changes.
 * @param title - The title text or React component displayed at the top of the dialog.
 * @param description - Optional description text displayed below the title.
 * @param children - React nodes to be rendered as the dialog's main content.
 * @param className - Optional additional CSS classes for customizing the dialog's appearance.
 */
export function BaseDataDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BaseDataDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] ${className || ""}`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            {typeof title === "string" ? title : <div>{title}</div>}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
