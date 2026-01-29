import {
  AlertOctagon,
  CheckCircle2,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { ResourceType, ResourceStatus } from "./enums";

export interface ResourceTypeOption {
  label: string;
  value: (typeof ResourceType)[keyof typeof ResourceType];
}

export interface ResourceStatusOption {
  label: string;
  value: (typeof ResourceStatus)[keyof typeof ResourceStatus];
  icon: LucideIcon;
}

export const resourceTypeOptions: ResourceTypeOption[] = [
  { label: "Stanza Doppia", value: ResourceType.DOUBLE_ROOM },
  { label: "Stanza Singola", value: ResourceType.SINGLE_ROOM },
  { label: "Suite", value: ResourceType.SUITE },
  { label: "Piazzola Campeggio", value: ResourceType.CAMPSITE_PITCH },
  { label: "Appartamento", value: ResourceType.APARTMENT },
];

export const resourceStatusOptions: ResourceStatusOption[] = [
  { label: "Disponibile", value: ResourceStatus.AVAILABLE, icon: CheckCircle2 },
  { label: "Manutenzione", value: ResourceStatus.MAINTENANCE, icon: Hammer },
  {
    label: "Fuori servizio",
    value: ResourceStatus.OUT_OF_ORDER,
    icon: AlertOctagon,
  },
];
