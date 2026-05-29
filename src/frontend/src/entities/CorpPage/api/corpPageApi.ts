import apiClient from '../../../shared/api/axiosConfig';
import type { CorpPage, CorpPageSummary, CorpPageVersionSummary, CorpSettings } from '../model/types';

const BASE = '/web-builder/pages';

export const webBuilderApi = {
  getPages: () =>
    apiClient.get<CorpPageSummary[]>(BASE),

  getPage: (slug: string) =>
    apiClient.get<CorpPage>(`${BASE}/${slug}`),

  createPage: (data: { pageType: string; slug: string; title: string }) =>
    apiClient.post<CorpPage>(BASE, data),

  updateLayout: (id: string, layoutConfigJson: string, themeOverrideJson?: string | null) =>
    apiClient.put(`${BASE}/${id}/layout`, { layoutConfigJson, themeOverrideJson }),

  updateSeo: (id: string, data: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    openGraphImageUrl: string | null;
  }) =>
    apiClient.put(`${BASE}/${id}/seo`, data),

  updateBacklinks: (id: string, backlinksJson: string) =>
    apiClient.put(`${BASE}/${id}/backlinks`, { backlinksJson }),

  publishPage: (id: string, isPublished: boolean) =>
    apiClient.put(`${BASE}/${id}/publish`, { isPublished }),

  deletePage: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  getVersions: (id: string) =>
    apiClient.get<CorpPageVersionSummary[]>(`${BASE}/${id}/versions`),

  createCheckpoint: (id: string, label: string) =>
    apiClient.post(`${BASE}/${id}/versions/checkpoint`, { label }),

  rollbackVersion: (versionId: string) =>
    apiClient.post(`${BASE}/versions/${versionId}/rollback`),

  getSettings: () =>
    apiClient.get<CorpSettings>('/web-builder/settings'),

  updateSettings: (data: CorpSettings) =>
    apiClient.put('/web-builder/settings', data),
};
