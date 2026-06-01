import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { SubscriptionPlan } from '../model/types';

export function usePlansQuery() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['landing', 'plans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/plans');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
