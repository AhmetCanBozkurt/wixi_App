import { API_ROUTES } from '../config/api.config';
import type {
    IApplicationCreateDto,
    IApplicationUpdateDto,
    IApplicationResponseDto,
    IStepUpdateDto,
    ISubStepUpdateDto,
    IApplicationHistoryDto,
    IApplicationTemplateDto
} from '../types/ApplicationTypes';
import { TokenService } from './TokenService';
import { toast } from 'sonner';

class ApplicationService {
    private static instance: ApplicationService;
    private tokenService: TokenService;

    private constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): ApplicationService {
        if (!ApplicationService.instance) {
            ApplicationService.instance = new ApplicationService();
        }
        return ApplicationService.instance;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.tokenService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Create application
    async createApplication(createDto: IApplicationCreateDto): Promise<IApplicationResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Başvuru oluşturulurken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Başvuru başarıyla oluşturuldu');
            return result;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

    // Get application by ID
    async getApplicationById(applicationId: number): Promise<IApplicationResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.BY_ID(applicationId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching application:', error);
            throw error;
        }
    }

    // Get client applications
    async getClientApplications(clientId: number, lang?: string): Promise<IApplicationResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const endpoint = lang
                ? `${API_ROUTES.APPLICATIONS.CLIENT(clientId)}?lang=${encodeURIComponent(lang)}`
                : API_ROUTES.APPLICATIONS.CLIENT(clientId);
            const response = await fetch(endpoint, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Başvurular yüklenirken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                console.error('Error fetching client applications:', errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            // Backend returns: { success: true, data: [...], count: ... }
            const applications = result?.data || result || [];
            return Array.isArray(applications) ? applications : [];
        } catch (error) {
            console.error('Error fetching client applications:', error);
            throw error;
        }
    }

    // Get all applications (Admin)
    async getAllApplications(): Promise<IApplicationResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.BASE, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all applications:', error);
            throw error;
        }
    }

    // Update application
    async updateApplication(applicationId: number, updateDto: IApplicationUpdateDto): Promise<IApplicationResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.BY_ID(applicationId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Başvuru güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Başvuru başarıyla güncellendi');
            return result;
        } catch (error) {
            console.error('Error updating application:', error);
            throw error;
        }
    }

    // Delete application (Admin)
    async deleteApplication(applicationId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.BY_ID(applicationId), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Başvuru silinirken hata oluştu');
                throw new Error(error.message);
            }

            toast.success('Başvuru başarıyla silindi');
        } catch (error) {
            console.error('Error deleting application:', error);
            throw error;
        }
    }

    // Update step status
    async updateStepStatus(stepId: number, updateDto: IStepUpdateDto): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.UPDATE_STEP(stepId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                let errorMessage = 'Adım güncellenirken hata oluştu';
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        const error = JSON.parse(errorText);
                        errorMessage = error.message || errorMessage;
                    } else {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }
                } catch (parseError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            toast.success(result.message || 'Adım durumu güncellendi');
        } catch (error) {
            console.error('Error updating step:', error);
            if (error instanceof Error && !error.message.includes('HTTP')) {
                toast.error(error.message || 'Adım güncellenirken hata oluştu');
            }
            throw error;
        }
    }

    // Update substep status
    async updateSubStepStatus(subStepId: number, updateDto: ISubStepUpdateDto): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.UPDATE_SUBSTEP(subStepId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                let errorMessage = 'Alt adım güncellenirken hata oluştu';
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        const error = JSON.parse(errorText);
                        errorMessage = error.message || errorMessage;
                    } else {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }
                } catch (parseError) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            toast.success(result.message || 'Alt adım durumu güncellendi');
        } catch (error) {
            console.error('Error updating substep:', error);
            if (error instanceof Error && !error.message.includes('HTTP')) {
                toast.error(error.message || 'Alt adım güncellenirken hata oluştu');
            }
            throw error;
        }
    }

    // Get application history
    async getApplicationHistory(applicationId: number): Promise<IApplicationHistoryDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.HISTORY(applicationId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching application history:', error);
            throw error;
        }
    }

    // Get all templates
    async getAllTemplates(): Promise<IApplicationTemplateDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.TEMPLATES, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch templates');
            }

            const result = await response.json();
            // Handle response format: {success, data, count} or direct array
            const data = result?.data || result || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    // Get template by ID
    async getTemplateById(templateId: number): Promise<IApplicationTemplateDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.APPLICATIONS.TEMPLATE_BY_ID(templateId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching template:', error);
            throw error;
        }
    }
}

export default ApplicationService.getInstance();

