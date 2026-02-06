import { api } from "@/lib/api"; 
import { ItalianCity } from "@/types/geo";

// gest italian cities
export const GeoService = {
  getItalianCities: async (): Promise<ItalianCity[]> => {
    const response = await api.get<ItalianCity[]>("/api/geo/italian-cities");
    return response.data;
  },
};