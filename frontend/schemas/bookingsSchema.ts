import { z } from "zod";

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  CANCELLED: "CANCELLED",
} as const;

export const PaymentStatus = {
  UNPAID: "UNPAID",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  PAID_IN_FULL: "PAID_IN_FULL",
  REFUNDED: "REFUNDED",
} as const;

export const DocumentType = {
  ID_CARD: "ID_CARD",
  PASSPORT: "PASSPORT",
  DRIVING_LICENSE: "DRIVING_LICENSE",
  OTHER: "OTHER",
} as const;

export const GuestType = {
  ADULT: "ADULT",
  CHILD: "CHILD",
  INFANT: "INFANT",
} as const;

/**
 * --- GUEST SCHEMA (READ MODEL) ---
 * This schema represents a guest as it comes from the DB.
 * Note: Many fields are .optional() or .nullable() because in the PENDING phase they do not exist yet.
 */
export const guestReadSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().optional(),
  
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  
  // will be filled during check in phase
  address: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  documentType: z.enum(DocumentType).optional().nullable(),
  documentNumber: z.string().optional().nullable(),
  
  guestType: z.enum(GuestType).default(GuestType.ADULT),
  notes: z.string().optional().nullable(),
});

export const bookingExtraSchema = z.object({
  extraOptionId: z.string().optional(),
  nameSnapshot: z.string(),
  descriptionSnapshot: z.string().optional(),
  priceSnapshot: z.number(),
  quantity: z.number(),
});

export const priceBreakdownSchema = z.object({
  baseAmount: z.number().default(0),
  extrasAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  depositAmount: z.number().default(0),
  finalTotal: z.number().default(0),
  taxDescription: z.string().optional().nullable(),
});

// bookinSchema used to visualize data into the bookings table
export const bookingSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  
  // main guest during PENDING will have only name/email/phone
  mainGuest: guestReadSchema,
  
  checkIn: z.string(),
  checkOut: z.string(),
  
  companions: z.array(guestReadSchema).default([]),
  extras: z.array(bookingExtraSchema).default([]),
  
  status: z.nativeEnum(BookingStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  priceBreakdown: priceBreakdownSchema.optional(),
  
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// create booking form schema with essential fields only
export const createBookingFormSchema = z.object({
  resourceId: z.string({ error: "Seleziona una risorsa" }).min(1),
  
  checkIn: z.date({ error: "Data check-in richiesta" }),
  checkOut: z.date({ error: "Data check-out richiesta" }),
  
  guestFirstName: z.string().min(2, "Nome richiesto"),
  guestLastName: z.string().min(2, "Cognome richiesto"),
  guestEmail: z.email("Email non valida").optional().or(z.literal("")),
  guestPhone: z.string().optional().or(z.literal("")),
  
  // deposit amount (if any)
  depositAmount: z.coerce.number().min(0).optional(),
  
  // expected number of guests to eventually compute preventive pricing
  expectedGuestsCount: z.coerce.number().min(1).default(1),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "La data di partenza deve essere successiva all'arrivo",
  path: ["checkOut"],
});


export type Booking = z.infer<typeof bookingSchema>;
export type BookingGuest = z.infer<typeof guestReadSchema>;
export type CreateBookingFormValues = z.infer<typeof createBookingFormSchema>;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
export type GuestType = (typeof GuestType)[keyof typeof GuestType];