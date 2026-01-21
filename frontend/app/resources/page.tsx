"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { BedDouble } from "lucide-react";
import { columns } from "./components/ResourceColumns";
import { ResourceTableToolbar } from "./components/ResourceTableToolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { Resource } from "@/schemas/resourcesSchema";

// Simuliamo la fetch (Sostituisci con la tua chiamata Axios)
const fetchResources = async () => {
  // await api.get('/resources')
  return [
    {
      id: "1",
      name: "Room 101",
      type: "ROOM",
      capacity: 2,
      status: "AVAILABLE",
    },
    {
      id: "2",
      name: "Room 102",
      type: "ROOM",
      capacity: 2,
      status: "MAINTENANCE",
    },
    {
      id: "3",
      name: "Suite A",
      type: "SUITE",
      capacity: 4,
      status: "AVAILABLE",
    },
    {
      id: "4",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "5",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "6",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "7",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "8",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "9",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
    {
      id: "45",
      name: "Apt 5",
      type: "APARTMENT",
      capacity: 6,
      status: "OUT_OF_ORDER",
    },
  ] as Resource[];
};

export default function ResourcesPage() {
  // Query Dati
  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      {/* HEADER */}
      {/* //fixme: header generico per le pagine */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
          <p className="text-muted-foreground">
            Manage your rooms, apartments, and facilities here.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => console.log("Open New Sheet")}>
            <Plus className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        // Qui metteremo il TableSkeleton
        <div className="text-center py-10">Loading resources...</div>
      ) : resources && resources.length > 0 ? (
        <DataTable
          data={resources}
          columns={columns}
          renderToolbar={(table) => <ResourceTableToolbar table={table} />}
        />
      ) : (
        <EmptyState
          title="Nessuna risorsa trovata"
          description="Crea la tua prima risorsa per iniziare a gestirla"
          icon={BedDouble}
          action={<Button>Aggiungi risorsa</Button>} //FIXME: aggiungi onClick
        />
      )}
    </div>
  );
}
