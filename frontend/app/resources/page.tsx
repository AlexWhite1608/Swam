"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { BedDouble } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useResources } from "@/hooks/tanstack-query/useResources";
import { columns } from "./components/ResourceColumns";
import { ResourceTableToolbar } from "./components/ResourceTableToolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { NAV_ITEMS } from "@/lib/navigation";
import { Loading } from "@/components/common/Loading";
import { Error } from "@/components/common/Error";

export default function ResourcesPage() {
  const { data: resources, isLoading, isError, refetch } = useResources();

  // FIXME: componente dedicato
  if (isError) {
    return (
      <Error onRetry={() => refetch()} />
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* header */}
      <PageHeader
        title="Risorse"
        description="Gestisci le risorse disponibili nel tuo sistema"
        action={
          <Button onClick={() => console.log("Open New Sheet")}>
            <Plus className="h-4 w-4" /> Aggiungi risorsa
          </Button>
        }
      />

      {/* content */}
      {isLoading ? (
        <Loading />
      ) : resources && resources.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <DataTable
            data={resources}
            columns={columns}
            renderToolbar={(table) => <ResourceTableToolbar table={table} />}
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
    </div>
  );
}
