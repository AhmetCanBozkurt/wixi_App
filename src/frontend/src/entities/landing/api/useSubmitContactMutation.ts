import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';
import type { ContactSubmitPayload } from '../model/types';

export function useSubmitContactMutation() {
  return useMutation({
    mutationFn: async (payload: ContactSubmitPayload) => {
      const { data } = await apiClient.post('/landing/contact', payload);
      return data;
    },
  });
}
