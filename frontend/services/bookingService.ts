import { api } from "@/lib/api";
import { Booking, PaymentStatus } from "@/schemas/bookingsSchema";

export interface CreateBookingPayload {
  resourceId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
  depositAmount?: number;
}

export interface CheckInPayload {
  phone: string;
  address: string;
  birthDate: string; // YYYY-MM-DD
  documentType: string;
  documentNumber: string;
  country?: string;
  guestType: string;
  companions?: any[]; //FIXME: definisci meglio
}

export interface CheckOutPayload {
  extras: {
    extraOptionId: string;
    quantity: number;
  }[];
}

export interface BookingSearchParams {
  resourceId?: string;
  customerId?: string;
}

export const bookingService = {
  // Get all bookings
  getAll: async (): Promise<Booking[]> => {
    const { data } = await api.get("/api/bookings");
    return data;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const { data } = await api.get(`/api/bookings/${id}`);
    return data;
  },

  // Create new booking
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await api.post("/api/bookings", payload);
    return data;
  },

  // Confirm Booking (Switch from PENDING to CONFIRMED)
  confirm: async ({
    id,
    hasPaidDeposit,
  }: {
    id: string;
    hasPaidDeposit: boolean;
  }): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/confirm`, null, {
      params: { hasPaidDeposit },
    });
    return data;
  },

  // Check-in
  checkIn: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CheckInPayload;
  }): Promise<Booking> => {
    const { data } = await api.post(`/api/bookings/${id}/check-in`, payload);
    return data;
  },

  // Check-out
  checkOut: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CheckOutPayload;
  }): Promise<Booking> => {
    const { data } = await api.post(`/api/bookings/${id}/check-out`, payload);
    return data;
  },

  // Update Payment Status
  updatePaymentStatus: async ({
    id,
    status,
  }: {
    id: string;
    status: PaymentStatus;
  }): Promise<Booking> => {
    const { data } = await api.patch(
      `/api/bookings/${id}/payment-status`,
      null,
      {
        params: { status },
      },
    );
    return data;
  },

  //TODO: Delete Booking anche nel controller
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/bookings/${id}`);
  },
};
