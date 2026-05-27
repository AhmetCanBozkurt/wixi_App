import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { PlatformStat } from '../model/types';

export function useStatsQuery(lang = 'tr') {
  return useQuery<PlatformStat[]>({
    queryKey: ['landing', 'stats', lang],
    queryFn: async () => {
      const { data } = await apiClient.get('/landing/stats/public', { params: { lang } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
