import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { CasesData } from '../model/types';

export function useCasesQuery(lang = 'tr', industry?: string) {
  return useQuery<CasesData>({
    queryKey: ['landing', 'cases', lang, industry ?? 'all'],
    queryFn: async () => {
      const params: Record<string, string> = { lang };
      if (industry) params.industry = industry;
      const { data } = await apiClient.get('/landing/cases/public', { params });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
