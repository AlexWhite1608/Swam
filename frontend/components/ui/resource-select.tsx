"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceStatusBadge } from "@/components/common/badges/ResourceStatusBadge";
import { Resource } from "@/schemas/createResourceSchema";

interface ResourceSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  resources?: Resource[];
  isLoading?: boolean;
}

export function ResourceSelect({
  value,
  onValueChange,
  resources,
  isLoading,
}: ResourceSelectProps) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-full overflow-x-hidden">
        <SelectValue
          placeholder={isLoading ? "Caricamento..." : "Seleziona risorsa"}
          className="truncate"
        />
      </SelectTrigger>
      <SelectContent>
        {resources?.map((resource) => (
          <SelectItem key={resource.id} value={resource.id}>
            <div className="flex items-center justify-between w-full gap-2 max-w-[20rem]">
              <span className="truncate flex-1" title={resource.name}>
                {resource.name}
              </span>
              {resource.status !== "AVAILABLE" && (
                <ResourceStatusBadge status={resource.status} showIcon={false} />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}