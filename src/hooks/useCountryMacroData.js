import { useQuery } from "@tanstack/react-query";
import { fetchCountryMacroData } from "../services/worldBankApi";

export function useCountryMacroData(countryCode) {
  return useQuery({
    queryKey: ["country-macro-data", countryCode],
    queryFn: () => fetchCountryMacroData(countryCode),
    enabled: Boolean(countryCode),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}