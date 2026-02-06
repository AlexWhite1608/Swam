import { useQuery } from "@tanstack/react-query";
import { GeoService } from "@/services/geoService";
import { ItalianCity } from "@/types/geo";

export const useItalianPlaces = () => {
  return useQuery<ItalianCity[]>({
    queryKey: ["italian-cities"],
    queryFn: GeoService.getItalianCities,
    staleTime: Infinity, // data available indefinitely
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};