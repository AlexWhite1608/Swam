"use client";

import { useMemo, useState } from "react";

import { useResources } from "@/hooks/tanstack-query/useResources";
import { getBookingColumns } from "@/app/bookings/_components/BookingColumns";
import { Booking } from "@/schemas/bookingsSchema";
import { useBookings, useCancelBooking, useDeleteBooking } from "../tanstack-query/useBookings";

// booking dialog mode types
export type BookingDialogMode = "CREATE" | "EDIT" | "CHECKIN" | "CHECKOUT";

export const useBookingsPage = () => {
  // fetch bookings
  const {
    data: bookings,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useBookings();

  // fetch resources for booking assignments
  const {
    data: resources,
    isLoading: isResourcesLoading,
    isError: isResourceError,
  } = useResources();

  const isLoading = isBookingsLoading || isResourcesLoading;
  const isError = isBookingsError || isResourceError;

  const deleteBookingMutation = useDeleteBooking();
  const cancelBookingMutation = useCancelBooking();

  // dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // dialog for managing different modes (CREATE, EDIT, CHECKIN, CHECKOUT)
  const [dialogMode, setDialogMode] = useState<BookingDialogMode>("CREATE");

  // selection states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // opens the dialog in CREATE booking mode
  const openCreateDialog = () => {
    setSelectedBooking(null);
    setDialogMode("CREATE");
    setIsDialogOpen(true);
  };

  // opens the dialog in EDIT booking mode (with selected booking)
  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogMode("EDIT");
    setIsDialogOpen(true);
  };

  // opens the dialog in CHECK-IN mode
  const openCheckInDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogMode("CHECKIN");
    setIsDialogOpen(true);
  };

  // opens the dialog in CHECK-OUT mode
  const openCheckOutDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogMode("CHECKOUT");
    setIsDialogOpen(true);
  };

  // opens the confirm booking dialog
  const openConfirmDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsConfirmDialogOpen(true);
  };

  // Delete Single
  const requestDelete = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!bookingToDelete) return;
    deleteBookingMutation.mutate(bookingToDelete.id, {
      onSuccess: () => {
        setBookingToDelete(null);
        setIsDeleteDialogOpen(false);
      },
    });
  };

  // cancel booking (set status to CANCELED)
  const openCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!bookingToCancel) return;
    cancelBookingMutation.mutate(bookingToCancel.id, {
        onSuccess: () => {
            setBookingToCancel(null);
            setIsCancelDialogOpen(false);
        }
    });
  };

  //TODO: Bulk Delete

  // columns
  const columns = useMemo(
    () =>
      getBookingColumns({
        resources: resources || [],
        onEdit: openEditDialog,
        onDelete: requestDelete,
        onCheckIn: openCheckInDialog,
        onCheckOut: openCheckOutDialog,
        onConfirm: openConfirmDialog,
        onCancel: openCancelDialog,
      }),
    [resources],
  );

  return {
    // Data
    bookings,
    resources,
    isLoading,
    isError,
    refetch: refetchBookings,
    columns,

    // States for Dialogs
    dialogs: {
      isOpen: isDialogOpen,
      mode: dialogMode, // to manage CREATE, EDIT, CHECKIN, CHECKOUT modes
      isDeleteOpen: isDeleteDialogOpen,
      isConfirmOpen: isConfirmDialogOpen,
      isCancelOpen: isCancelDialogOpen,
    },

    // Data State
    selections: {
      selectedBooking,
      bookingToDelete,
      bookingToCancel,
    },

    // Mutation State
    isDeleting: deleteBookingMutation.isPending,
    isCanceling: cancelBookingMutation.isPending,

    // Actions
    actions: {
      setIsOpen: setIsDialogOpen,
      setDeleteOpen: setIsDeleteDialogOpen,
      setConfirmOpen: setIsConfirmDialogOpen,
      setCancelOpen: setIsCancelDialogOpen,

      openCreateDialog,
      openEditDialog,
      openCheckInDialog,
      openCheckOutDialog,
      openConfirmDialog,
      confirmDelete,
      confirmCancel,
    },
  };
};
