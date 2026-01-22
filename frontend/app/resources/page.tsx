"use client";

import { useMemo, useState } from "react";
import { Plus, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useResources } from "@/hooks/tanstack-query/useResources";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { Error } from "@/components/common/Error";
import { DataTable } from "@/components/data-table/data-table";
import { Resource } from "@/schemas/resourcesSchema";
import { ResourceTableToolbar } from "./_components/ResourceTableToolbar";
import { ResourceDialog } from "./_components/ResourceDialog";
import { getResourceColumns } from "./_components/ResourceColumns";

export default function ResourcesPage() {
  const { data: resources, isLoading, isError, refetch } = useResources();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  // get table columns
  const columns = useMemo(
    () =>
      getResourceColumns({
        onEdit: (resource) => handleOpenEdit(resource),
        onDelete: (resource) => {
          //TODO: Qui aprirai il ConfirmDialog di cancellazione
        },
        onStatusChange: (resource, status) => {
          // TODO: Qui chiami direttamente la mutation per lo status change
        },
      }),
    [],
  );

  // new resource dialog action
  const handleOpenCreate = () => {
    setSelectedResource(null);
    setIsDialogOpen(true);
  };

  // edit resource dialog action
  const handleOpenEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  };

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
          icon={BedDouble}
          action={<Button onClick={handleOpenCreate}>Crea Risorsa</Button>}
        />
      )}

      <ResourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        resource={selectedResource}
      />
    </div>
  );
}
