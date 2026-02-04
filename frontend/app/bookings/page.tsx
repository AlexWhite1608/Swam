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
import { BookingDialog } from "./_components/BookingDialog";
import { BookingTableFilters } from "./_components/BookingTableFilters";
import { ConfirmBookingDialog } from "./_components/ConfirmBookingDialog";
import { ConfirmDepositDialog } from "./_components/ConfirmDepositDialog";
import { EditStayDialog } from "./_components/EditStayDialog";
import { BookingExtrasDialog } from "./_components/BookingExtraDialog";

export default function BookingsPage() {
  const {
    bookings,
    resources,
    isLoading,
    isError,
    refetch,
    columns,
    dialogs,
    selections,
    isDeleting,
    isCanceling,
    isBulkDeleting,
    actions,
    resetSelectionTrigger,
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
            key={resetSelectionTrigger}
            data={bookings}
            columns={columns}
            renderToolbar={(table) => <BookingTableToolbar table={table} />} // search bar
            renderFilters={(table) => (
              <BookingTableFilters table={table} resources={resources} />
            )}
            onBulkDelete={actions.requestBulkDelete}
            onRowClick={(row) => actions.openEditDialog(row)}
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

      {/* booking dialog with mode */}
      <BookingDialog
        open={dialogs.isOpen}
        onOpenChange={actions.setIsOpen}
        mode={dialogs.mode}
        booking={selections.selectedBooking}
      />

      {/* Confirm booking dialog */}
      <ConfirmBookingDialog
        isOpen={dialogs.isConfirmOpen}
        onOpenChange={actions.setConfirmOpen}
        booking={selections.selectedBooking}
      />

      {/* Confirm deposit dialog */}
      <ConfirmDepositDialog
        isOpen={dialogs.isConfirmDepositOpen}
        onOpenChange={actions.setConfirmDepositOpen}
        booking={selections.bookingForDeposit}
      />

      {/* Single system Delete Confirmation */}
      <ConfirmDialog
        isOpen={dialogs.isDeleteOpen}
        onClose={() => actions.setDeleteOpen(false)}
        onConfirm={actions.confirmDelete}
        title="Rimuovi Prenotazione"
        description={
          <>
            Sei sicuro di voler rimuovere dal sistema la prenotazione a nome di{" "}
            <strong>{selections.bookingToDelete?.mainGuest.lastName}</strong>?
            Questa azione è irreversibile.
          </>
        }
        variant="destructive"
        confirmText="Rimuovi"
        isLoading={isDeleting}
      />

      {/* cancel booking confirmation */}
      <ConfirmDialog
        isOpen={dialogs.isCancelOpen}
        onClose={() => actions.setCancelOpen(false)}
        onConfirm={actions.confirmCancel}
        title="Cancella Prenotazione"
        description={
          <>
            Stai per cancellare la prenotazione di{" "}
            <strong>{selections.bookingToCancel?.mainGuest.lastName}</strong>.
            <br className="mb-2" />
            La prenotazione rimarrà nel sistema con stato{" "}
            <strong>"CANCELLATA"</strong> ma non sarà più attiva.
          </>
        }
        confirmText="Conferma"
        isLoading={isCanceling}
      />

      <BookingExtrasDialog
        isOpen={dialogs.isExtrasDialogOpen}
        onOpenChange={actions.setExtrasDialogOpen}
        booking={selections.bookingToManageExtras}
      />

      <EditStayDialog
        isOpen={dialogs.isExtendSplitOpen}
        onOpenChange={actions.setExtendSplitOpen}
        booking={selections.bookingToExtend}
      />

      {/* bulk delete */}
      <ConfirmDialog
        key="bulk-delete"
        isOpen={dialogs.isBulkDeleteOpen}
        onClose={() => actions.setBulkDeleteOpen(false)}
        onConfirm={actions.confirmBulkDelete}
        title="Rimuovi prenotazioni selezionate"
        description={
          <>
            Stai per rimuovere dal sistema{" "}
            <strong>{selections.bookingsToBulkDelete.length}</strong>{" "}
            prenotazion
            {selections.bookingsToBulkDelete.length > 1 ? "i" : "e"}. Questa
            azione è irreversibile.
          </>
        }
        variant="destructive"
        confirmText="Rimuovi"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
