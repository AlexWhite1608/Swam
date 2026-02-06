import { BookingExtra } from "../extras/types";
import type {
  BookingStatus,
  PaymentStatus,
  DocumentType,
  GuestType,
  Sex,
  GuestRole,
} from "./enums";

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus];
export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type DocumentTypeType = (typeof DocumentType)[keyof typeof DocumentType];
export type GuestTypeType = (typeof GuestType)[keyof typeof GuestType];
export type SexType = (typeof Sex)[keyof typeof Sex];
export type GuestRoleType = (typeof GuestRole)[keyof typeof GuestRole];

// fields marked as optional may be omitted when creating a new booking and will be filled during check-in phase
export interface BookingGuest {
  id?: string;
  customerId?: string;

  firstName: string;
  lastName: string;

  arrivalDate?: string;
  departureDate?: string;

  sex?: SexType | null;
  birthDate?: string | null;

  placeOfBirth?: string | null;
  citizenship?: string | null;

  email?: string;
  phone?: string;

  documentType?: DocumentTypeType | null;
  documentNumber?: string | null;
  documentPlaceOfIssue?: string | null;

  guestType?: GuestTypeType;
  guestRole?: GuestRoleType | null;

  taxExempt?: boolean;
  taxExemptReason?: string | null;
}

export interface PriceBreakdown {
  baseAmount: number;
  extrasAmount: number;
  taxAmount: number;
  discountAmount: number;
  depositAmount: number;
  finalTotal: number;
  taxDescription?: string | null;
}

export interface Booking {
  id: string;
  groupId?: string;
  parentBookingId?: string;
  resourceId: string;
  mainGuest: BookingGuest;
  checkIn: string;
  checkOut: string;
  companions: BookingGuest[];
  extras: BookingExtra[];
  status: BookingStatusType;
  paymentStatus: PaymentStatusType;
  priceBreakdown?: PriceBreakdown;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// form values for creating a booking
export interface CreateBookingFormValues {
  resourceId: string;
  checkIn?: Date;
  checkOut?: Date;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
  depositAmount?: number;
}
