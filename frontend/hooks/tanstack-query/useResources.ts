import { getErrorMessage } from "@/lib/api";
import { resourceKeys } from "@/lib/query-keys";
import { ResourceStatus } from "@/schemas/resourcesSchema";
import { resourceService } from "@/services/resourceService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Get all resources
export const useResources = () => {
  return useQuery({
    queryKey: resourceKeys.all,
    queryFn: resourceService.getAll,
    staleTime: 1000 * 60 * 5,
  });
};

// Get resource by ID
export const useResource = (id: string) => {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourceService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Check resource availability
export const useResourceAvailability = (id: string) => {
  return useQuery({
    queryKey: [...resourceKeys.detail(id), "availability"],
    queryFn: () => resourceService.isAvailable(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
  });
};

// Create resource
export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      toast.success("Risorsa creata con successo");
    },
    onError: (error: any) => {
      toast.error("Impossibile creare la risorsa", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Update resource
export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceService.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data.id) });
      toast.success("Risorsa aggiornata con successo");
    },
    onError: (error: any) => {
      toast.error("Impossibile modificare la risorsa", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Update resource status
export const useUpdateResourceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResourceStatus }) =>
      resourceService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(variables.id),
      });
      toast.success("Stato risorsa aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error("Impossibile aggiornare lo stato della risorsa", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Delete resource
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      toast.success("Risorsa rimossa con successo");
    },
    onError: (error: any) => {
      toast.error("Impossibile rimuovere la risorsa", {
        description: getErrorMessage(error),
      });
    },
  });
};

// Bulk delete resources
export const useBulkDeleteResources = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceService.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      toast.success("Risorse selezionate eliminate con successo");
    },
    onError: (error: any) => {
      toast.error("Impossibile eliminare le risorse selezionate", {
        description: getErrorMessage(error),
      });
    },
  });
};
