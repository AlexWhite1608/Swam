import { GuestRole, GuestType, Sex } from "@/types/bookings/enums";
import { z } from "zod";

export const companionCheckInSchema = z.object({
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),

  sex: z.enum(Sex, "Seleziona il sesso dell'ospite"),

  birthDate: z.date("Data di nascita obbligatoria"),

  placeOfBirth: z.string().optional(),
  citizenship: z.string().optional(), // iso code

  guestType: z.enum(GuestType, "Seleziona il tipo di ospite"),
  guestRole: z.enum(GuestRole, "Seleziona il ruolo dell'ospite"),
});
