"use client";

import { ColumnDef } from "@tanstack/react-table";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  CircleX,
  Euro,
  Link,
  LogIn,
  LogOut,
  MoreHorizontal,
  ShoppingBag,
  Split,
  Trash,
  User,
  Users,
} from "lucide-react";

import { BookingStatusBadge } from "@/components/common/badges/BookingStatusBadge";
import { PaymentStatusBadge } from "@/components/common/badges/PaymentStatusBadge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dateRangeFilterFn, formatCurrency } from "@/lib/utils";
import { Booking } from "@/types/bookings/types";
import { Resource } from "@/types/resources/types";

interface GetBookingColumnsProps {
  resources: Resource[];
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onConfirmDeposit: (booking: Booking) => void;
  onManageExtras: (booking: Booking) => void;
  onExtendSplit: (booking: Booking) => void;
}

export const getBookingColumns = ({
  resources,
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
  onConfirm,
  onCancel,
  onConfirmDeposit,
  onManageExtras,
  onExtendSplit,
}: GetBookingColumnsProps): ColumnDef<Booking>[] => [
  // select
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleziona tutti"
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

  // booking status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stato" />
    ),
    cell: ({ row }) => <BookingStatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },

  // unified guest data
  {
    id: "guest",
    meta: { excludeFromFilterCount: true }, // exclude from filter count
    accessorFn: (row) => row.mainGuest.lastName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ospite Principale" />
    ),
    cell: ({ row, table }) => {
      const guest = row.original.mainGuest;
      const isChained = !!row.original.groupId;
      const parentBookingId = row.original.parentBookingId;
      const groupId = row.original.groupId;

      // Find related bookings in the same group
      const allBookings = table
        .getRowModel()
        .rows.map((r: { original: any }) => r.original);
      const linkedBookings = allBookings.filter(
        (b: { groupId: string | undefined; id: string }) =>
          b.groupId === groupId && b.id !== row.original.id,
      );

      // Find parent booking if exists
      const parentBooking = parentBookingId
        ? allBookings.find((b: { id: string }) => b.id === parentBookingId)
        : null;

      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm leading-tight truncate">
                {guest.lastName} {guest.firstName}
              </span>

              {/* show if booking is linked to another */}
              {isChained && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="bg-blue-100 text-blue-600 p-0.5 rounded-sm">
                        <Link className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold border-b pb-1">
                          Prenotazione Collegata
                        </p>

                        <div className="space-y-1">
                          {linkedBookings.length > 0 && (
                            <>
                              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {linkedBookings.map((linked: Booking) => (
                                  <div
                                    key={linked.id}
                                    className="p-1.5 bg-muted/50 rounded text-[10px] space-y-0.5"
                                  >
                                    <div className="font-medium">
                                      <User className="h-3 w-3 mr-1 mb-0.5 inline-block text-muted-foreground" />
                                      {linked.mainGuest.lastName}{" "}
                                      {linked.mainGuest.firstName}
                                    </div>
                                    <div className="text-muted-foreground">
                                      <CalendarDays className="h-3 w-3 mr-1 mb-0.5 inline-block text-muted-foreground" />
                                      {format(
                                        parseISO(linked.checkIn),
                                        "dd/MM/yy",
                                        { locale: it },
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        parseISO(linked.checkOut),
                                        "dd/MM/yy",
                                        { locale: it },
                                      )}
                                    </div>
                                    <div className="text-muted-foreground">
                                      <BedDouble className="h-3 w-3 mr-1 mb-0.5 inline-block text-muted-foreground" />
                                      {resources.find(
                                        (r) => r.id === linked.resourceId,
                                      )?.name || "-"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate ">
              {guest.email || guest.phone || "-"}
            </span>
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const guest = row.original.mainGuest;
      const searchStr = `${guest.firstName} ${guest.lastName}`.toLowerCase();
      return searchStr.includes(String(filterValue).toLowerCase());
    },
  },

  // resource name
  {
    accessorKey: "resourceId",
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Risorsa" />
    ),
    cell: ({ row }) => {
      const resId = row.getValue("resourceId") as string;
      const resource = resources.find((r) => r.id === resId);

      return (
        <span className="font-medium text-sm truncate block">
          {resource && resource.name ? resource.name : "-"}
        </span>
      );
    },
  },

  // booking period
  {
    id: "period",
    accessorFn: (row) => row.checkIn,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Soggiorno" />
    ),
    filterFn: dateRangeFilterFn,
    cell: ({ row }) => {
      const checkIn = parseISO(row.original.checkIn);
      const checkOut = parseISO(row.original.checkOut);
      const nights = differenceInCalendarDays(checkOut, checkIn);

      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 text-sm font-medium truncate">
            <span className="truncate">
              {format(checkIn, "dd/MM/yy", { locale: it })}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">
              {format(checkOut, "dd/MM/yy", { locale: it })}
            </span>
          </div>
          <div className="mt-0.5 flex">
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm whitespace-nowrap">
              {nights} nott{nights > 1 ? "i" : "e"}
            </span>
          </div>
        </div>
      );
    },
  },

  // number of guests
  {
    id: "guests",
    header: "Numero ospiti",
    cell: ({ row }) => {
      const companions = row.original.companions || [];
      const mainGuest = row.original.mainGuest;

      const allGuests = [mainGuest, ...companions];

      const adults = allGuests.filter((g) => g.guestType === "ADULT");
      const children = allGuests.filter((g) => g.guestType === "CHILD");
      const infants = allGuests.filter((g) => g.guestType === "INFANT");

      const totalCount = allGuests.length;
      const hasNotCheckIn =
        row.original.status === "PENDING" ||
        row.original.status === "CONFIRMED";

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help w-fit">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{totalCount}</span>
                {hasNotCheckIn && (
                  <span className="h-2 w-2 ml-2 rounded-full bg-yellow-300 border border-yellow-300" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-2">
                <p className="font-semibold border-b pb-1">
                  Lista Ospiti {hasNotCheckIn && "(in attesa di check-in)"}
                </p>

                {adults.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      Adulti ({adults.length})
                    </p>
                    <ul className="list-disc list-inside pl-2">
                      {adults.map((guest, idx) => (
                        <li key={idx}>
                          {guest.lastName} {guest.firstName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {children.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      Bambini ({children.length})
                    </p>
                    <ul className="list-disc list-inside pl-2">
                      {children.map((guest, idx) => (
                        <li key={idx}>
                          {guest.lastName} {guest.firstName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {infants.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      Neonati ({infants.length})
                    </p>
                    <ul className="list-disc list-inside pl-2">
                      {infants.map((guest, idx) => (
                        <li key={idx}>
                          {guest.lastName} {guest.firstName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // payment status
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pagamento" />
    ),
    cell: ({ row }) => (
      <PaymentStatusBadge status={row.getValue("paymentStatus")} />
    ),
  },

  // total
  {
    accessorKey: "priceBreakdown",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Totale" />
    ),
    cell: ({ row }) => {
      const breakdown = row.original.priceBreakdown;

      if (!breakdown || breakdown.finalTotal === 0) {
        return (
          <span className="text-xs text-muted-foreground italic truncate block">
            Da calcolare
          </span>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-bold text-sm cursor-help truncate">
                {formatCurrency(breakdown.finalTotal)}
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-56" align="end">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Soggiorno:</span>{" "}
                  <span>{formatCurrency(breakdown.baseAmount)}</span>
                </div>
                {breakdown.extrasAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Extra:</span>{" "}
                    <span>{formatCurrency(breakdown.extrasAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tasse:</span>{" "}
                  <span>{formatCurrency(breakdown.taxAmount)}</span>
                </div>
                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sconto:</span>{" "}
                    <span>-{formatCurrency(breakdown.discountAmount)}</span>
                  </div>
                )}
                <DropdownMenuSeparator />
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>Totale:</span>{" "}
                  <span>{formatCurrency(breakdown.finalTotal)}</span>
                </div>
                {breakdown.depositAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Caparra:</span>{" "}
                    <span>{formatCurrency(breakdown.depositAmount)}</span>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // actions
  {
    id: "actions",
    header: () => <span>Azioni</span>,
    cell: ({ row }) => {
      const breakdown = row.original.priceBreakdown;
      const isDepositPaid = row.original.paymentStatus === "DEPOSIT_PAID";
      const hasDepositToPay =
        (breakdown?.depositAmount ?? 0) > 0 && !isDepositPaid;
      const isCancelled = row.original.status === "CANCELLED";
      const isCheckedIn = row.original.status === "CHECKED_IN";

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Apri menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* //fixme: rimuovi?? */}
              {/* <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="h-4 w-4 hover:text-foreground" />
                Modifica
              </DropdownMenuItem> */}

              {hasDepositToPay && !isCancelled && (
                <DropdownMenuItem
                  onClick={() => onConfirmDeposit(row.original)}
                >
                  <Euro className="h-4 w-4 hover:text-foreground" />
                  Conferma Acconto
                </DropdownMenuItem>
              )}

              {row.original.status === "PENDING" && (
                <DropdownMenuItem onClick={() => onConfirm(row.original)}>
                  <Check className="h-4 w-4 hover:text-foreground" />
                  Conferma Prenotazione
                </DropdownMenuItem>
              )}

              {!isCancelled && isCheckedIn && (
                <DropdownMenuItem onClick={() => onManageExtras(row.original)}>
                  <ShoppingBag className="h-4 w-4 hover:text-foreground" />
                  Gestione Extra
                </DropdownMenuItem>
              )}

              {/* cannot extend if it is not check in */}
              {row.original.status === "CHECKED_IN" && (
                <DropdownMenuItem onClick={() => onExtendSplit(row.original)}>
                  <Split className="h-4 w-4 hover:text-foreground" />
                  Modifica Soggiorno
                </DropdownMenuItem>
              )}

              {row.original.status === "CONFIRMED" && (
                <DropdownMenuItem onClick={() => onCheckIn(row.original)}>
                  <LogIn className="h-4 w-4 hover:text-foreground" /> Esegui
                  Check-in
                </DropdownMenuItem>
              )}

              {row.original.status === "CHECKED_IN" && (
                <DropdownMenuItem onClick={() => onCheckOut(row.original)}>
                  <LogOut className="h-4 w-4 hover:text-foreground" /> Esegui
                  Check-out
                </DropdownMenuItem>
              )}

              {(row.original.status === "PENDING" ||
                row.original.status === "CONFIRMED") && (
                <DropdownMenuItem onClick={() => onCancel(row.original)}>
                  <CircleX className="h-4 w-4 hover:text-foreground" />
                  Cancella Prenotazione
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash className="h-4 w-4 text-red-600/70" />
                Rimuovi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
