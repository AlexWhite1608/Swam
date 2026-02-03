import { z } from "zod";

export const extendSchema = z.object({
  newCheckOut: z.date({ error: "" }),
  newResourceId: z.string().optional(),
});

export const splitSchema = z.object({
  splitDate: z.date({ error: "" }),
  newResourceId: z.string().min(1, ""),
});

export type ExtendFormValues = z.infer<typeof extendSchema>;
export type SplitFormValues = z.infer<typeof splitSchema>;
export type OperationMode = "extend" | "split";
