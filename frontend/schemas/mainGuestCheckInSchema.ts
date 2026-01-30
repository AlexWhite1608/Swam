// mainGuestCheckInSchema.ts
import { DocumentType, GuestRole, GuestType, Sex } from "@/types/bookings/enums";
import { z } from "zod";
import { companionCheckInSchema } from "./companionCheckInSchema";

export const mainGuestCheckInSchema = z.object({
  // main guest details
  firstName: z.string().min(1, { message: "" }),
  lastName: z.string().min(1, { message: "" }),
  sex: z.enum(Sex),
  birthDate: z.date().optional(),
  
  placeOfBirth: z.string(),
  citizenship: z.string(), // iso code

  email: z.email("Email non valida").optional().or(z.literal("")),
  phone: z.string().optional(),

  // main guest document details
  documentType: z.enum(DocumentType),
  documentNumber: z.string().min(1, { message: "" }),
  documentPlaceOfIssue: z.string().optional(),

  guestType: z.enum(GuestType),
  guestRole: z.enum(GuestRole),

  // optional notes for the booking
  notes: z.string().optional(),

  // companion list
  companions: z.array(companionCheckInSchema).optional(),
}).refine((data) => data.birthDate !== undefined, {
  message: "",
  path: ["birthDate"],
});

export type CheckInFormValues = z.infer<typeof mainGuestCheckInSchema>;