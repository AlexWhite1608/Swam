import { z } from "zod";
import {
  BedDouble,
  Building,
  CheckCircle2,
  Hammer,
  AlertOctagon,
  Armchair,
} from "lucide-react";

export const ResourceType = {
  DOUBLE_ROOM: "DOUBLE_ROOM",
  SINGLE_ROOM: "SINGLE_ROOM",
  SUITE: "SUITE",
  CAMPSITE_PITCH: "CAMPSITE_PITCH",
  APARTMENT: "APARTMENT",
} as const;

export const ResourceStatus = {
  AVAILABLE: "AVAILABLE",
  MAINTENANCE: "MAINTENANCE",
  OUT_OF_ORDER: "OUT_OF_ORDER",
} as const;

export const typeOptions = [
  { label: "Stanza Doppia", value: ResourceType.DOUBLE_ROOM },
  { label: "Stanza Singola", value: ResourceType.SINGLE_ROOM },
  { label: "Suite", value: ResourceType.SUITE },
  {
    label: "Piazzola Campeggio",
    value: ResourceType.CAMPSITE_PITCH,
  },
  { label: "Appartamento", value: ResourceType.APARTMENT },
];

export const statusOptions = [
  { label: "Disponibile", value: ResourceStatus.AVAILABLE, icon: CheckCircle2 },
  { label: "Manutenzione", value: ResourceStatus.MAINTENANCE, icon: Hammer },
  {
    label: "Fuori servizio",
    value: ResourceStatus.OUT_OF_ORDER,
    icon: AlertOctagon,
  },
];

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nome deve avere almeno 2 caratteri"),
  type: z.enum(ResourceType),
  capacity: z
    .number()
    .int()
    .positive("Capacità deve essere un numero positivo"),
  status: z.enum(ResourceStatus),
});

export type Resource = z.infer<typeof resourceSchema>;
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];
export type ResourceStatus = typeof ResourceStatus[keyof typeof ResourceStatus];
