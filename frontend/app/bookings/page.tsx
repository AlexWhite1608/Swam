"use client";

import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { Error } from "@/components/common/Error";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { NAV_ITEMS } from "@/lib/navigation";

import { BookingTableToolbar } from "./_components/BookingTableToolbar";
import { useBookingsPage } from "@/hooks/pages/useBookingPage";

export default function BookingsPage() {
  const {
    bookings,
    isLoading,
    isError,
    refetch,
    columns,
    dialogs,
    selections,
    isDeleting,
    actions,
  } = useBookingsPage();

  if (isError) return <Error onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* header */}
      <PageHeader
        title="Prenotazioni"
        description="Gestisci prenotazioni, check-in e check-out."
        action={
          <Button onClick={actions.openCreateDialog}>
            <Plus className="h-4 w-4" /> Nuova Prenotazione
          </Button>
        }
      />

      {/* main content */}
      {isLoading ? (
        <Loading />
      ) : bookings && bookings.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <DataTable
            data={bookings}
            columns={columns}
            renderToolbar={(table) => <BookingTableToolbar table={table} />}
            // onRowClick={actions.openEditDialog} //todo: GESTIONE EDIT con un altro dialog ancora??
          />
        </div>
      ) : (
        <EmptyState
          title="Nessuna prenotazione trovata"
          description="Aggiungi una nuova prenotazione."
          icon={
            NAV_ITEMS.find((item) => item.href === "/bookings")?.icon ||
            CalendarDays
          }
        />
      )}

      {/* //todo: dialog create/edit */}

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={dialogs.isDeleteOpen}
        onClose={() => actions.setDeleteOpen(false)}
        onConfirm={actions.confirmDelete}
        title="Cancella Prenotazione"
        description={
          <>
            Sei sicuro di voler cancellare la prenotazione a nome di{" "}
            <strong>{selections.bookingToDelete?.mainGuest.lastName}</strong>?
            Questa azione è irreversibile.
          </>
        }
        variant="destructive"
        confirmText="Cancella"
        isLoading={isDeleting}
      />

      {/* //TODO: dialog bulk delete */}
    </div>
  );
}
