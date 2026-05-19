import { apiClient } from "../axiosConfig";

export interface ModuleDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  isActive: boolean;
  priceMonthly: number | null;
  priceYearly: number | null;
  featuresJson: string | null;
  colorAccent: string | null;
  isPopular: boolean;
  sortOrder: number;
}

export interface ModuleMenuTranslationDto {
  languageId: string;
  title: string;
}

export interface ModuleMenuDto {
  id: string;
  moduleId: string;
  parentId: string | null;
  path: string;
  icon: string | null;
  iconColor: string | null;
  sortOrder: number;
  visibleToTenant: boolean;
  translations: ModuleMenuTranslationDto[];
  children: ModuleMenuDto[];
}

export const moduleService = {
  getModules: async (): Promise<ModuleDto[]> => {
    const response = await apiClient.get<ModuleDto[]>("/Module");
    return response.data;
  },
  getPublicModules: async (): Promise<ModuleDto[]> => {
    const response = await apiClient.get<ModuleDto[]>("/Module/public");
    return response.data;
  },
  createModule: async (data: Partial<ModuleDto>): Promise<string> => {
    const response = await apiClient.post<string>("/Module", data);
    return response.data;
  },
  updateModule: async (data: Partial<ModuleDto>): Promise<void> => {
    await apiClient.put("/Module", data);
  },
  getModuleMenus: async (moduleId: string): Promise<ModuleMenuDto[]> => {
    const response = await apiClient.get<ModuleMenuDto[]>(`/ModuleMenu/${moduleId}`);
    return response.data;
  },
  createModuleMenu: async (data: unknown): Promise<string> => {
    const response = await apiClient.post<string>("/ModuleMenu", { menu: data });
    return response.data;
  },
  updateModuleMenu: async (id: string, data: unknown): Promise<void> => {
    await apiClient.put(`/ModuleMenu/${id}`, data);
  },
  deleteModuleMenu: async (id: string): Promise<void> => {
    await apiClient.delete(`/ModuleMenu/${id}`);
  },
  syncModuleMenus: async (items: { id: string; parentId: string | null; sortOrder: number }[]): Promise<void> => {
    await apiClient.post('/ModuleMenu/sync', { items });
  },
  deleteModule: async (id: string): Promise<void> => {
    await apiClient.delete(`/Module/delete/${id}`);
  },
  seedSystemMenus: async (): Promise<void> => {
    await apiClient.post("/Module/seed-system-menus");
  },
};
