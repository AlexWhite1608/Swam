import { api } from "@/lib/api";
import { ExtraOption } from "@/types/extras/types";

export const extraOptionService = {
  // Get all extras (default includeInactive = false)
  getAll: async (includeInactive: boolean = false): Promise<ExtraOption[]> => {
    const { data } = await api.get("/api/extras", {
      params: { includeInactive },
    });
    return data;
  },

  // Get single extra by ID
  getById: async (id: string): Promise<ExtraOption> => {
    const { data } = await api.get(`/api/extras/${id}`);
    return data;
  },
};
