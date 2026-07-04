import { apiClient } from '../../../shared/api/axiosConfig';
import type { ProjectBoardDto, ProjectListDto, TaskDetailDto } from '../model/types';

// Entities katmanı: sadece GET çağrıları (FSD kuralı)

export const projectApi = {
  getProjects: async (status?: number, search?: string): Promise<ProjectListDto[]> => {
    const params = new URLSearchParams();
    if (status !== undefined) params.set('status', String(status));
    if (search) params.set('search', search);
    const res = await apiClient.get<ProjectListDto[]>(`/store-admin/projects?${params}`);
    return res.data;
  },

  getBoard: async (projectId: string): Promise<ProjectBoardDto> => {
    const res = await apiClient.get<ProjectBoardDto>(`/store-admin/projects/${projectId}/board`);
    return res.data;
  },

  getTask: async (taskId: string): Promise<TaskDetailDto> => {
    const res = await apiClient.get<TaskDetailDto>(`/store-admin/projects/tasks/${taskId}`);
    return res.data;
  },
};
