import { api } from "@/lib/api";
import { Booking, CreateBookingFormValues } from "@/types/bookings/types";
import type {
  PaymentStatusType,
  SexType,
  DocumentTypeType,
  GuestTypeType,
  GuestRoleType,
} from "@/types/bookings/types";

export interface CreateBookingPayload {
  resourceId: string;
  checkIn: string;
  checkOut: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
  depositAmount?: number;
}

export interface CheckInCompanion {
  customerId?: string;
  firstName: string;
  lastName: string;
  sex: SexType;
  birthDate: string;
  email?: string;
  phone?: string;
  placeOfBirth?: string;
  citizenship?: string;
  documentType?: DocumentTypeType;
  documentNumber?: string;
  documentPlaceOfIssue?: string;
  guestType: GuestTypeType;
  guestRole: GuestRoleType;
}

export interface CheckInPayload {
  customerId?: string;
  firstName: string;
  lastName: string;
  sex: SexType;
  birthDate: string;
  email?: string;
  phone?: string;
  placeOfBirth?: string;
  citizenship?: string;
  documentType: DocumentTypeType;
  documentNumber: string;
  documentPlaceOfIssue?: string;
  guestType: GuestTypeType;
  guestRole: GuestRoleType;
  notes?: string; // refers to the booking
  companions?: CheckInCompanion[];
}

export interface UpdateStayPayload {
  resourceId: string;
  checkIn: string;
  checkOut: string;
}

export interface ExtendBookingPayload {
  newResourceId: string;
  newCheckOutDate: string;
}

export interface UnavailablePeriod {
  start: string;
  end: string;
}

export interface ConfirmBookingParams {
  id: string;
  hasPaidDeposit: boolean;
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

  // Update booking (simple edit for pending/confirmed)
  update: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CreateBookingFormValues;
  }): Promise<Booking> => {
    const { data } = await api.put(`/api/bookings/${id}`, payload);
    return data;
  },

  // Update Stay (change check-in/check-out dates or resource)
  updateStay: async ({
    id,
    payload,
  }: {
    id: string;
    payload: UpdateStayPayload;
  }): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/stay`, payload);
    return data;
  },

  // Extend or Split Booking by creating a new booking for the extended period
  extendWithSplit: async ({
    id,
    payload,
  }: {
    id: string;
    payload: ExtendBookingPayload;
  }): Promise<Booking> => {
    const { data } = await api.post(`/api/bookings/${id}/extend-split`, payload);
    return data;
  },

  // Update Check-In details (for checked-in bookings)
  updateCheckIn: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CheckInPayload;
  }): Promise<Booking> => {
    const { data } = await api.put(
      `/api/bookings/${id}/update-check-in`,
      payload,
    );
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

  // cancel booking (set status to CANCELED)
  cancel: async (id: string): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/cancel`);
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

  // Get unavailable periods for a resource
  getUnavailablePeriods: async (
    resourceId: string,
    excludeBookingId?: string,
  ): Promise<UnavailablePeriod[]> => {
    const { data } = await api.get("/api/bookings/unavailable-dates", {
      params: {
        resourceId,
        excludeBookingId,
      },
    });
    return data;
  },

  // Update Payment Status
  updatePaymentStatus: async ({
    id,
    status,
  }: {
    id: string;
    status: PaymentStatusType;
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

  // soft delete booking
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/bookings/${id}`);
  },

  // bulk delete bookings
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post("/api/bookings/bulk-delete", { ids });
  },
};
