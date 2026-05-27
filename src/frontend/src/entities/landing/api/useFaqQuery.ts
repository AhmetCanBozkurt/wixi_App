import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { FaqCategory } from '../model/types';

export function useFaqQuery(lang = 'tr') {
  return useQuery<FaqCategory[]>({
    queryKey: ['landing', 'faq', lang],
    queryFn: async () => {
      const { data } = await apiClient.get('/landing/faq/public', { params: { lang } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
