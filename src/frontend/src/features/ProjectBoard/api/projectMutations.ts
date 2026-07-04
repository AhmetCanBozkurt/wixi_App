import { apiClient } from '../../../shared/api/axiosConfig';
import type { ProjectListDto, TaskBoardDto, TaskCommentDto, TimeEntryDto } from '../../../entities/Project';

// Features katmanı: POST/PUT/PATCH/DELETE çağrıları (FSD kuralı)

export interface ProjectFormPayload {
  name: string;
  description?: string | null;
  customerId?: string | null;
  cariId?: string | null;
  customerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  currency?: string | null;
  color?: string | null;
}

export interface TaskFormPayload {
  title: string;
  description?: string | null;
  parentTaskId?: string | null;
  priority: number;
  status: number;
  startDate?: string | null;
  dueDate?: string | null;
  durationDays?: number | null;
}

export const projectMutations = {
  createProject: async (payload: ProjectFormPayload): Promise<ProjectListDto> => {
    const res = await apiClient.post<ProjectListDto>('/store-admin/projects', payload);
    return res.data;
  },

  updateProject: async (id: string, payload: ProjectFormPayload & { status: number }): Promise<void> => {
    await apiClient.put(`/store-admin/projects/${id}`, payload);
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/store-admin/projects/${id}`);
  },

  createTask: async (projectId: string, payload: TaskFormPayload): Promise<TaskBoardDto> => {
    const res = await apiClient.post<TaskBoardDto>(`/store-admin/projects/${projectId}/tasks`, payload);
    return res.data;
  },

  updateTask: async (taskId: string, payload: {
    title: string;
    description?: string | null;
    priority: number;
    progress: number;
    startDate?: string | null;
    dueDate?: string | null;
    durationDays?: number | null;
  }): Promise<void> => {
    await apiClient.put(`/store-admin/projects/tasks/${taskId}`, payload);
  },

  updateTaskStatus: async (taskId: string, status: number, sortOrder: number): Promise<void> => {
    await apiClient.patch(`/store-admin/projects/tasks/${taskId}/status`, { status, sortOrder });
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/store-admin/projects/tasks/${taskId}`);
  },

  addComment: async (taskId: string, content: string): Promise<TaskCommentDto> => {
    const res = await apiClient.post<TaskCommentDto>(`/store-admin/projects/tasks/${taskId}/comments`, { content });
    return res.data;
  },

  startTime: async (taskId: string): Promise<TimeEntryDto> => {
    const res = await apiClient.post<TimeEntryDto>(`/store-admin/projects/tasks/${taskId}/time/start`);
    return res.data;
  },

  stopTime: async (taskId: string, note?: string): Promise<TimeEntryDto> => {
    const res = await apiClient.post<TimeEntryDto>(`/store-admin/projects/tasks/${taskId}/time/stop`, { note: note ?? null });
    return res.data;
  },
};
