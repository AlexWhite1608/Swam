import { z } from "zod";

// create booking form schema with essential fields only
export const createBookingSchema = z
  .object({
    resourceId: z.string().min(1, { message: "" }),

    checkIn: z.date().optional(),
    checkOut: z.date().optional(),

    guestFirstName: z.string().min(1, { message: "" }),
    guestLastName: z.string().min(1, { message: "" }),
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
        message: "",
        path: ["checkIn"],
      });
    }
  });
