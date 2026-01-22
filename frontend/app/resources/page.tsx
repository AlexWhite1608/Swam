"use client";

import { useMemo, useState } from "react";
import { Plus, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useResources,
  useDeleteResource,
  useUpdateResourceStatus,
} from "@/hooks/tanstack-query/useResources";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { Error } from "@/components/common/Error";
import { DataTable } from "@/components/data-table/data-table";
import { Resource, ResourceStatus } from "@/schemas/resourcesSchema";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { NAV_ITEMS } from "@/lib/navigation";
import { getResourceColumns } from "./_components/ResourceColumns";
import { ResourceTableToolbar } from "./_components/ResourceTableToolbar";
import { ResourceDialog } from "./_components/ResourceDialog";

export default function ResourcesPage() {
  const { data: resources, isLoading, isError, refetch } = useResources();

  const deleteResourceMutation = useDeleteResource();
  const updateStatusMutation = useUpdateResourceStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null,
  );

  // create resource
  const handleOpenCreate = () => {
    setSelectedResource(null);
    setIsDialogOpen(true);
  };

  // edit resource
  const handleOpenEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  };

  // handle delete resource
  const handleDeleteRequest = (resource: Resource) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  };

  // confirm delete resource dialog
  const handleConfirmDelete = () => {
    if (!resourceToDelete) return;

    deleteResourceMutation.mutate(resourceToDelete.id, {
      onSuccess: () => {
        setResourceToDelete(null);
        setIsDeleteDialogOpen(false);
      },
    });
  };

  // handle status change
  const handleStatusChange = (resource: Resource, status: ResourceStatus) => {
    updateStatusMutation.mutate({ id: resource.id, status });
  };

  const columns = useMemo(
    () =>
      getResourceColumns({
        onEdit: handleOpenEdit,
        onDelete: handleDeleteRequest,
        onStatusChange: handleStatusChange,
      }),
    [],
  );

  if (isError) return <Error onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full space-y-4">
      <PageHeader
        title="Risorse"
        description="Gestisci le risorse disponibili nel tuo sistema"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Aggiungi risorsa
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : resources && resources.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <DataTable
            data={resources}
            columns={columns}
            renderToolbar={(table) => <ResourceTableToolbar table={table} />}
            onRowClick={(row) => handleOpenEdit(row)}
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

      {/* create/edit resource dialog */}
      <ResourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        resource={selectedResource}
      />

      {/* confirm delete dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Elimina Risorsa"
        description={
          <>
            Sei sicuro di voler eliminare la risorsa "
            <strong>{resourceToDelete?.name}</strong>"? Questa azione non può
            essere annullata.
          </>
        }
        variant="destructive"
        confirmText="Elimina"
        isLoading={deleteResourceMutation.isPending}
      />
    </div>
  );
}
