import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { RoadmapData } from '../model/types';

export function useRoadmapQuery(lang = 'tr') {
  return useQuery<RoadmapData>({
    queryKey: ['landing', 'roadmap', lang],
    queryFn: async () => {
      const { data } = await apiClient.get('/landing/roadmap/public', { params: { lang } });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVoteRoadmapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, sessionToken }: { itemId: string; sessionToken: string }) => {
      const { data } = await apiClient.post(`/landing/roadmap/${itemId}/vote`, { sessionToken });
      return data as { voteCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing', 'roadmap'] });
    },
  });
}
