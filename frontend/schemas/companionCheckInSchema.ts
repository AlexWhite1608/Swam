// companionCheckInSchema.ts
import { GuestRole, GuestType, Sex } from "@/types/bookings/enums";
import { z } from "zod";

export const companionCheckInSchema = z
  .object({
    firstName: z.string().min(1, { message: "" }),
    lastName: z.string().min(1, { message: "" }),

    sex: z.enum(Sex),

    birthDate: z.date().optional(),

    placeOfBirth: z.string().optional(),
    citizenship: z.string().optional(), // iso code

    guestType: z.enum(GuestType),
    guestRole: z.enum(GuestRole),
  })
  .refine((data) => data.birthDate !== undefined, {
    message: "",
    path: ["birthDate"],
  });
