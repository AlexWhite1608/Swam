import { ResourceStatus, ResourceType } from "@/types/resources/enums";
import { z } from "zod";

export const createResourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "" }),
  type: z.enum(ResourceType),
  capacity: z
    .number()
    .int()
    .positive(),
  status: z.enum(ResourceStatus),
});
