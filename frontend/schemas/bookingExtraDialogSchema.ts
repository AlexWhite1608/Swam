import z from "zod";

export const extrasSchema = z.object({
  extras: z.array(
    z.object({
      extraOptionId: z.string().min(1, ""),
      quantity: z.coerce.number().min(1, ""),
    }),
  ),
});

export type ExtrasFormValues = z.infer<typeof extrasSchema>;