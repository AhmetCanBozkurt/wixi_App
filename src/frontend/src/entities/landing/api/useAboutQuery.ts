import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { AboutData } from '../model/types';

export function useAboutQuery(lang = 'tr') {
  return useQuery<AboutData>({
    queryKey: ['landing', 'about', lang],
    queryFn: async () => {
      const { data } = await apiClient.get('/landing/about/public', { params: { lang } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
