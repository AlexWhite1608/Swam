import type { ResourceType, ResourceStatus } from "./enums";

export type ResourceTypeType = (typeof ResourceType)[keyof typeof ResourceType];
export type ResourceStatusType = (typeof ResourceStatus)[keyof typeof ResourceStatus];

export interface Resource {
  id: string;
  name: string;
  type: ResourceTypeType;
  capacity: number;
  status: ResourceStatusType;
}