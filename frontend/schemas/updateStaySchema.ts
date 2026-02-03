import z from "zod";

export const updateStaySchema = z.object({
  resourceId: z.string().min(1, ""),
  checkIn: z.date({ error: "" }),
  checkOut: z.date({ error: "" }),
});
