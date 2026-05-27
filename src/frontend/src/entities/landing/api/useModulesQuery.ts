import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { LandingModule } from '../model/types';

export function useModulesQuery() {
  return useQuery<LandingModule[]>({
    queryKey: ['landing', 'modules'],
    queryFn: async () => {
      const { data } = await apiClient.get('/Module/public');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
