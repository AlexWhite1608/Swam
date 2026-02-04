import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bookingService,
  CreateBookingPayload,
  CheckInPayload,
  CheckOutPayload,
  ConfirmBookingParams,
} from "@/services/bookingService";
import { toast } from "sonner";
import { bookingKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import { PaymentStatusType } from "@/types/bookings/types";

// Get all bookings
export const useBookings = () => {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: () => bookingService.getAll(),
    staleTime: 1000 * 60 * 1,
  });
};

// Get booking by ID
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
};

// Create booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Prenotazione creata con successo");
    },
    onError: (error: unknown) => {
      toast.error("Errore creazione prenotazione", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Confirm booking
export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hasPaidDeposit }: ConfirmBookingParams) =>
      bookingService.confirm({ id, hasPaidDeposit }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Prenotazione confermata");
    },
    onError: (error: any) => {
      toast.error("Errore conferma prenotazione", {
        description:
          error?.response?.data?.message ||
          "Impossibile confermare la prenotazione",
      });
    },
  });
};

// Cancel booking (set status to CANCELED)
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Prenotazione cancellata");
    },
    onError: (error: unknown) => {
      toast.error("Errore cancellazione prenotazione", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Update booking (simple edit for pending/confirmed)
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: { id: string; payload: any }, //FIXME: payload typing può essere raffinato
    ) => bookingService.update(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Prenotazione aggiornata");
    },
    onError: (error: any) => {
      toast.error("Errore aggiornamento", {
        description: error?.response?.data?.message || "Impossibile aggiornare",
      });
    },
  });
};

// Update Check-In details (for checked-in bookings)
export const useUpdateBookingCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; payload: CheckInPayload }) =>
      bookingService.updateCheckIn(data),
    onSuccess: (data) => {
      console.log("Check-in updated:", data);

      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Check in aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore aggiornamento dati", {
        description: error?.response?.data?.message || "Impossibile aggiornare",
      });
    },
  });
};

// Update stay details (for changing resource, dates)
export const useUpdateStay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingService.updateStay,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
    },
    onError: (error: any) => {
      toast.error("Errore modifica soggiorno", {
        description: getErrorMessage(error),
      });
    },
  });
};

// updates extras (add/remove extras for a booking)
export const useUpdateBookingExtras = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.updateExtras,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Extra aggiornati con successo");
    },
    onError: (error: any) => {
      toast.error("Errore aggiornamento extra", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Split booking given a split date and new resource
export const useSplitBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      payload: { splitDate: string; newResourceId: string };
    }) => bookingService.split(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Cambio risorsa effettuato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore cambio di risorsa nella prenotazione", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Extend or Split Booking by creating a new booking for the extended period
export const useExtendBookingWithSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.extendWithSplit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Prenotazione estesa e collegata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore estensione", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Update payment status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: PaymentStatusType }) =>
      bookingService.updatePaymentStatus(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Stato pagamento aggiornato con successo");
    },
    onError: (error: unknown) => {
      toast.error("Errore aggiornamento pagamento", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Check-in booking
export const useCheckInBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; payload: CheckInPayload }) =>
      bookingService.checkIn(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Check-in effettuato con successo");
    },
    onError: (error: unknown) => {
      toast.error("Errore Check-in", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Check-out booking
export const useCheckOutBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; payload: CheckOutPayload }) =>
      bookingService.checkOut(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Check-out completato");
    },
    onError: (error: unknown) => {
      toast.error("Errore Check-out", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Get unavailable dates for a resource
export const useUnavailableDates = (
  resourceId: string | undefined,
  excludeBookingId?: string,
) => {
  return useQuery({
    queryKey: [...bookingKeys.unavailable(resourceId), excludeBookingId],
    queryFn: () =>
      bookingService.getUnavailablePeriods(resourceId!, excludeBookingId),
    staleTime: 1000 * 60 * 5,
  });
};

// Delete booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Prenotazione rimossa dal sistema");
    },
    onError: (error: unknown) => {
      toast.error("Errore rimozione della prenotazione", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Bulk delete bookings
export const useBulkDeleteBookings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bookingService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success(
        "Prenotazioni selezionate rimosse dal sistema con successo",
      );
    },
    onError: (error: unknown) => {
      toast.error("Impossibile eliminare le prenotazioni selezionate", {
        description: getErrorMessage(error),
      });
    },
  });
};
