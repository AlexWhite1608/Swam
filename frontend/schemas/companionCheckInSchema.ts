import { GuestRole, GuestType, Sex } from "@/types/bookings/enums";
import { z } from "zod";

export const companionCheckInSchema = z
  .object({
    customerId: z.string().optional(),

    firstName: z.string().min(1, { message: "" }),
    lastName: z.string().min(1, { message: "" }),

    sex: z.enum(Sex),

    birthDate: z.date().optional(),

    placeOfBirth: z.string().min(1, { message: "" }),
    citizenship: z.string().min(1, { message: "" }),

    guestType: z.enum(GuestType),
    guestRole: z.enum(GuestRole),
  })
  .refine((data) => data.birthDate !== undefined, {
    message: "",
    path: ["birthDate"],
  });
