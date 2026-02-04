"use client";

import { useMemo, useState, useCallback } from "react";
import {
  useResources,
  useDeleteResource,
  useUpdateResourceStatus,
  useBulkDeleteResources,
} from "@/hooks/tanstack-query/useResources";
import { getResourceColumns } from "@/app/(protected)/resources/_components/ResourceColumns";
import { Resource, ResourceStatusType } from "@/types/resources/types";

export const useResourcesPage = () => {
  // fetch resources
  const { data: resources, isLoading, isError, refetch } = useResources();

  // mutations
  const deleteResourceMutation = useDeleteResource();
  const updateStatusMutation = useUpdateResourceStatus();
  const bulkDeleteMutation = useBulkDeleteResources();

  // dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // selection states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [resourcesToBulkDelete, setResourcesToBulkDelete] = useState<Resource[]>([]);
  
  // table reset callback
  const [resetSelectionTrigger, setResetSelectionTrigger] = useState(0);

  // Create / Edit
  const openCreateDialog = () => {
    setSelectedResource(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  }, []);

  // Status Change
  const handleStatusChange = useCallback((resource: Resource, status: ResourceStatusType) => {
    updateStatusMutation.mutate({ id: resource.id, status });
  }, [updateStatusMutation]);

  // Delete Single
  const requestDelete = useCallback((resource: Resource) => {
    setResourceToDelete(resource);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (!resourceToDelete) return;
    deleteResourceMutation.mutate(resourceToDelete.id, {
      onSuccess: () => {
        setResourceToDelete(null);
        setIsDeleteDialogOpen(false);
      },
    });
  };

  // Delete Bulk
  const requestBulkDelete = (resources: Resource[]) => {
    setResourcesToBulkDelete(resources);
    setIsBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    if (resourcesToBulkDelete.length === 0) return;
    const ids = resourcesToBulkDelete.map((r) => r.id);
    bulkDeleteMutation.mutate(ids, {
      onSuccess: () => {
        setResourcesToBulkDelete([]);
        setIsBulkDeleteDialogOpen(false);
        setResetSelectionTrigger(prev => prev + 1);
      },
    });
  };

  // columns
  const columns = useMemo(
    () =>
      getResourceColumns({
        onEdit: openEditDialog,
        onDelete: requestDelete,
        onStatusChange: handleStatusChange,
      }),
    [openEditDialog, requestDelete, handleStatusChange]
  );

  return {
    // Data
    resources,
    isLoading,
    isError,
    refetch,
    columns,
    
    // States for Dialogs
    dialogs: {
      isCreateEditOpen: isDialogOpen,
      isDeleteOpen: isDeleteDialogOpen,
      isBulkDeleteOpen: isBulkDeleteDialogOpen,
    },
    
    // Selected Data
    selections: {
      selectedResource,
      resourceToDelete,
      resourcesToBulkDelete,
    },

    // Loading States for Mutations
    isDeleting: deleteResourceMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    // Reset trigger
    resetSelectionTrigger,

    // Actions
    actions: {
      setCreateEditOpen: setIsDialogOpen,
      setDeleteOpen: setIsDeleteDialogOpen,
      setBulkDeleteOpen: setIsBulkDeleteDialogOpen,
      openCreateDialog,
      openEditDialog,
      requestBulkDelete,
      confirmDelete,
      confirmBulkDelete,
    },
  };
};