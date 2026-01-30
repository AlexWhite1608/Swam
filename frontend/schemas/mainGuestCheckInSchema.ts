import { DocumentType, GuestRole, GuestType, Sex } from "@/types/bookings/enums";
import { z } from "zod";
import { companionCheckInSchema } from "./companionCheckInSchema";

export const mainGuestCheckInSchema = z.object({
  // main guest details
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  sex: z.enum(Sex, "Seleziona il sesso dell'ospite"),
  birthDate: z.date("Data di nascita obbligatoria"), //FIXME: assicura che sia una data valida con un refine
  
  placeOfBirth: z.string(),
  citizenship: z.string(), // iso code

  email: z.email("Email non valida").optional().or(z.literal("")),
  phone: z.string().optional(),

  // main guest document details
  documentType: z.enum(DocumentType, "Seleziona il tipo di documento"),
  documentNumber: z.string().min(1, "Numero documento obbligatorio"),
  documentPlaceOfIssue: z.string().optional(),

  guestType: z.enum(GuestType, "Seleziona il tipo di ospite"),
  guestRole: z.enum(GuestRole, "Seleziona il ruolo dell'ospite"),

  // optional notes for the booking
  notes: z.string().optional(),

  // companion list
  companions: z.array(companionCheckInSchema).optional(),
});

export type CheckInFormValues = z.infer<typeof mainGuestCheckInSchema>;