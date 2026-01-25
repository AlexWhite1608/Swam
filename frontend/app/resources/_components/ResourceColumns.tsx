"use client";

import { ResourceStatusBadge } from "@/components/common/badges/ResourceStatusBadge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Resource,
  ResourceStatus,
  statusOptions,
  typeOptions,
} from "@/schemas/resourcesSchema";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power, Trash } from "lucide-react";

interface GetColumnsProps {
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onStatusChange: (resource: Resource, status: ResourceStatus) => void;
}

export const getResourceColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
}: GetColumnsProps): ColumnDef<Resource>[] => [
  // checkbox
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleziona tutte le righe"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleziona riga"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // name
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-medium truncate">{row.getValue("name")}</div>
      </div>
    ),
  },

  // type
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const type = typeOptions.find((t) => t.value === row.getValue("type"));
      if (!type) return null;

      return (
        <div className="flex items-center min-w-0">
          <span className="capitalize truncate">{type.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // capacity
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacità" />
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate">👤 {row.getValue("capacity")}</div>
      </div>
    ),
  },

  // status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stato" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue("status") as string;
      return (
        <div className="min-w-0">
          <ResourceStatusBadge status={statusValue} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  // actions
  {
    id: "actions",
    header: () => <span>Azioni</span>,
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()} className="min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Apri menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {/* edit */}
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4 hover:text-foreground" />
              Modifica
            </DropdownMenuItem>

            {/* change status */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Power className="h-4 w-4 hover:text-foreground" />
                Stato
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {statusOptions.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => onStatusChange(row.original, s.value)}
                  >
                    <s.icon className="h-4 w-4 hover:text-foreground" />
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* delete */}
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash className="h-4 w-4 text-red-600/70" />
              Cancella
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];