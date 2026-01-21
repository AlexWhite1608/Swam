import { api } from "@/lib/api";
import { Resource, ResourceStatus, ResourceType } from "@/schemas/resourcesSchema";

interface SearchResourcesParams {
  type?: ResourceType;
  status?: ResourceStatus;
  name?: string;
}

export const resourceService = {
  // Get all resources
  getAll: async (): Promise<Resource[]> => {
    const { data } = await api.get("/api/resources");
    return data;
  },

  // Get resource by ID
  getById: async (id: string): Promise<Resource> => {
    const { data } = await api.get(`/api/resources/${id}`);
    return data;
  },

  // Search resources with optional filters
  search: async (params?: SearchResourcesParams): Promise<Resource[]> => {
    const { data } = await api.get("/api/resources", { params });
    return data;
  },

  // Check resource availability
  isAvailable: async (id: string): Promise<boolean> => {
    const { data } = await api.get(`/api/resources/${id}/available`);
    return data;
  },

  // Create new resource
  create: async (resource: Omit<Resource, "id">): Promise<Resource> => {
    const { data } = await api.post("/api/resources", resource);
    return data;
  },

  // Update resource details
  update: async ({ id, ...resourceData }: Resource): Promise<Resource> => {
    const { data } = await api.put(`/api/resources/${id}`, resourceData);
    return data;
  },

  // Update resource status
  updateStatus: async (id: string, status: ResourceStatus): Promise<void> => {
    await api.patch(`/api/resources/${id}/status`, { status });
  },

  // Delete resource
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/resources/${id}`);
  },
};