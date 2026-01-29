import { ResourceStatus, ResourceType } from "@/types/resources/enums";
import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  type: z.enum(ResourceType, "Seleziona un tipo di risorsa valido"),
  capacity: z
    .number()
    .int()
    .positive("Capacità deve essere un numero positivo"),
  status: z.enum(ResourceStatus, "Seleziona uno stato valido"),
});
