import { z } from "zod";

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  CANCELLED: "CANCELLED",
} as const;

export const bookingStatusOptions = [
  { label: "In attesa", value: BookingStatus.PENDING },
  { label: "Confermata", value: BookingStatus.CONFIRMED },
  { label: "Check-in", value: BookingStatus.CHECKED_IN },
  { label: "Check-out", value: BookingStatus.CHECKED_OUT },
  { label: "Cancellata", value: BookingStatus.CANCELLED },
];

export const PaymentStatus = {
  UNPAID: "UNPAID",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  PAID_IN_FULL: "PAID_IN_FULL",
  REFUNDED: "REFUNDED",
} as const;

export const paymentStatusOptions = [
  { label: "Non Saldato", value: PaymentStatus.UNPAID },
  { label: "Acconto", value: PaymentStatus.DEPOSIT_PAID },
  { label: "Saldato", value: PaymentStatus.PAID_IN_FULL },
  { label: "Rimborsato", value: PaymentStatus.REFUNDED },
];

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

// bookingSchema used to visualize data into the bookings table
export const bookingSchema = z.object({
  id: z.string(),
  resourceId: z.string(),

  // main guest during PENDING will have only name/email/phone
  mainGuest: guestReadSchema,

  checkIn: z.string(),
  checkOut: z.string(),

  companions: z.array(guestReadSchema).default([]),
  extras: z.array(bookingExtraSchema).default([]),

  status: z.enum(BookingStatus),
  paymentStatus: z.enum(PaymentStatus),
  priceBreakdown: priceBreakdownSchema.optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// create booking form schema with essential fields only
export const createBookingFormSchema = z
  .object({
    resourceId: z.string().min(1, "Seleziona una risorsa"),

    checkIn: z.date().optional(),
    checkOut: z.date().optional(),

    guestFirstName: z.string().min(2, "Nome richiesto"),
    guestLastName: z.string().min(2, "Cognome richiesto"),
    guestEmail: z.email("Email non valida").optional().or(z.literal("")),
    guestPhone: z.string().optional().or(z.literal("")),

    depositAmount: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const missingCheckIn = !data.checkIn;
    const missingCheckOut = !data.checkOut;

    if (missingCheckIn && missingCheckOut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona il periodo",
        path: ["checkIn"],
      });
    }
  });

export type Booking = z.infer<typeof bookingSchema>;
export type BookingGuest = z.infer<typeof guestReadSchema>;
export type CreateBookingFormValues = z.infer<typeof createBookingFormSchema>;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
export type GuestType = (typeof GuestType)[keyof typeof GuestType];
