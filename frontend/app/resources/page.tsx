"use client";

import { Plus, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { Error } from "@/components/common/Error";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { NAV_ITEMS } from "@/lib/navigation";
import { ResourceTableToolbar } from "./_components/ResourceTableToolbar";
import { ResourceDialog } from "./_components/ResourceDialog";
import { useResourcesPage } from "@/hooks/pages/useResourcePage";

export default function ResourcesPage() {
  const {
    resources,
    isLoading,
    isError,
    refetch,
    columns,
    dialogs,
    selections,
    isDeleting,
    isBulkDeleting,
    actions,
  } = useResourcesPage();

  if (isError) return <Error onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* page header */}
      <PageHeader
        title="Risorse"
        description="Gestisci le risorse disponibili nel tuo sistema"
        action={
          <Button onClick={actions.openCreateDialog}>
            <Plus className="h-4 w-4" /> Aggiungi risorsa
          </Button>
        }
      />

      {/* main content */}
      {isLoading ? (
        <Loading />
      ) : resources && resources.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <DataTable
            data={resources}
            columns={columns}
            renderToolbar={(table) => (
              <ResourceTableToolbar
                table={table}
                onDeleteSelected={actions.requestBulkDelete}
              />
            )}
            onRowClick={actions.openEditDialog}
          />
        </div>
      ) : (
        <EmptyState
          title="Nessuna risorsa trovata"
          description="Crea la tua prima risorsa per iniziare a gestirla"
          icon={
            NAV_ITEMS.find((item) => item.href === "/resources")?.icon ||
            BedDouble
          }
        />
      )}

      {/* Create / Edit Form */}
      <ResourceDialog
        open={dialogs.isCreateEditOpen}
        onOpenChange={actions.setCreateEditOpen}
        resource={selections.selectedResource}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        key="single-delete"
        isOpen={dialogs.isDeleteOpen}
        onClose={() => actions.setDeleteOpen(false)}
        onConfirm={actions.confirmDelete}
        title="Elimina Risorsa"
        description={
          <>
            Sei sicuro di voler eliminare{" "}
            <strong>{selections.resourceToDelete?.name}</strong>? Questa azione
            è irreversibile.
          </>
        }
        variant="destructive"
        confirmText="Elimina"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        key="bulk-delete"
        isOpen={dialogs.isBulkDeleteOpen}
        onClose={() => actions.setBulkDeleteOpen(false)}
        onConfirm={actions.confirmBulkDelete}
        title="Elimina risorse selezionate"
        description={
          <>
            Stai per eliminare{" "}
            <strong>{selections.resourcesToBulkDelete.length}</strong> risorse.
            Questa azione è irreversibile.
          </>
        }
        variant="destructive"
        confirmText="Elimina selezionati"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
