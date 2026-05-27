import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axiosConfig';

export interface LegalDocument {
  slug: string;
  version: string;
  effectiveDate: string;
  title: string;
  contentHtml: string;
}

export function useLegalQuery(slug: string, lang = 'tr') {
  return useQuery<LegalDocument>({
    queryKey: ['landing', 'legal', slug, lang],
    queryFn: async () => {
      const { data } = await apiClient.get(`/landing/legal/${slug}`, { params: { lang } });
      return data;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
