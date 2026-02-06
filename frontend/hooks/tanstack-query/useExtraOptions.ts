import { useQuery } from "@tanstack/react-query";
import { extraOptionService } from "@/services/extraOptionService";
import { extraOptionKeys } from "@/lib/query-keys";

interface UseExtraOptionsProps {
  includeInactive?: boolean;
}

// Fetch extra options with optional inclusion of inactive ones
export const useExtraOptions = ({
  includeInactive = false,
}: UseExtraOptionsProps = {}) => {
  return useQuery({
    queryKey: extraOptionKeys.list(includeInactive),
    queryFn: () => extraOptionService.getAll(includeInactive),
    staleTime: 1000 * 60 * 5,
  });
};
