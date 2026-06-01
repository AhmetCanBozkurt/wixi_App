import { apiClient } from '../../../shared/api/axiosConfig';
import type { WebForm, WebFormListItem, WebFormSubmission } from '../model/types';

const BASE = '/web-builder/forms';

interface PagedResult<T> { items: T[]; totalCount: number; skip: number; take: number; }

export const corpFormApi = {
  getForms: () =>
    apiClient.get<WebFormListItem[]>(BASE),

  getFormBySlug: (slug: string) =>
    apiClient.get<WebForm>(`${BASE}/${slug}`),

  createForm: (data: { name: string; slug: string; fieldsJson?: string; submitButtonText?: string; successMessage?: string; notifyEmail?: string }) =>
    apiClient.post<WebForm>(BASE, data),

  updateForm: (id: string, data: { name: string; slug: string; fieldsJson?: string; submitButtonText?: string; successMessage?: string; notifyEmail?: string }) =>
    apiClient.put(`${BASE}/${id}`, data),

  deleteForm: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  getSubmissions: (id: string, skip = 0, take = 20) =>
    apiClient.get<PagedResult<WebFormSubmission>>(`${BASE}/${id}/submissions`, { params: { skip, take } }),
};
