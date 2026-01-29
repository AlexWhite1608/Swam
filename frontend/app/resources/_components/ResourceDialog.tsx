"use client";

import { BaseDataDialog } from "@/components/dialog/BaseDataDialog";
import { Resource } from "@/schemas/createResourceSchema";
import { ResourceForm } from "./ResourceForm";

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource | null; // if null or undefined, we are creating a new resource, else editing
}

export function ResourceDialog({
  open,
  onOpenChange,
  resource,
}: ResourceDialogProps) {
  const isEditing = !!resource;

  return (
    <BaseDataDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Modifica Risorsa" : "Nuova Risorsa"}
      description={
        isEditing
          ? "Modifica i dettagli della risorsa esistente."
          : "Compila i dati per aggiungere una nuova risorsa."
      }
    >
      <ResourceForm
        initialData={resource}
        onSuccess={() => {
          onOpenChange(false);
        }}
        onCancel={() => {
          onOpenChange(false);
        }}
      />
    </BaseDataDialog>
  );
}
