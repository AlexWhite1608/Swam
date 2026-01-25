import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  bookingService, 
  CreateBookingPayload, 
  CheckInPayload, 
  CheckOutPayload 
} from "@/services/bookingService";
import { toast } from "sonner";
import { bookingKeys } from "@/lib/query-keys";

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
    mutationFn: (payload: CreateBookingPayload) => bookingService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Prenotazione creata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore creazione prenotazione", {
        description: error?.response?.data?.message || "Impossibile creare la prenotazione",
      });
    },
  });
};

// Confirm booking
export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.confirm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      toast.success("Prenotazione confermata");
    },
    onError: (error: any) => {
      toast.error("Errore conferma", {
        description: error?.response?.data?.message,
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
      toast.success("Check-in effettuato");
    },
    onError: (error: any) => {
      toast.error("Errore Check-in", {
        description: error?.response?.data?.message,
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
    onError: (error: any) => {
      toast.error("Errore Check-out", {
        description: error?.response?.data?.message,
      });
    },
  });
};

// Delete booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success("Prenotazione cancellata");
    },
    onError: (error: any) => {
      toast.error("Errore cancellazione", {
        description: error?.response?.data?.message || "Impossibile cancellare la prenotazione",
      });
    },
  });
};