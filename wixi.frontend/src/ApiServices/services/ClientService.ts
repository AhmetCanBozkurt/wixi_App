import { API_ROUTES } from '../config/api.config';
import type {
    IClientCreateDto,
    IClientUpdateDto,
    IClientResponseDto,
    IEducationInfoCreateDto,
    IEducationInfoUpdateDto,
    IEducationInfoDto,
    IEducationTypeDto
} from '../types/ClientTypes';
import { TokenService } from './TokenService';
import { toast } from 'sonner';

class ClientService {
    private static instance: ClientService;
    private tokenService: TokenService;

    private constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): ClientService {
        if (!ClientService.instance) {
            ClientService.instance = new ClientService();
        }
        return ClientService.instance;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.tokenService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Create client profile
    async createClient(createDto: IClientCreateDto): Promise<IClientResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Profil oluşturulurken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Profil başarıyla oluşturuldu');
            return result;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    // Get client by ID
    async getClientById(clientId: number): Promise<IClientResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BY_ID(clientId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: ... }
            const clientData = result?.data || result;
            // Normalize field names from PascalCase to camelCase
            return this.normalizeClientData(clientData);
        } catch (error) {
            console.error('Error fetching client:', error);
            throw error;
        }
    }

    // Get client by user ID
    async getClientByUserId(userId: number): Promise<IClientResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BY_USER(userId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: ... }
            const clientData = result?.data || result;
            // Normalize field names from PascalCase to camelCase
            return this.normalizeClientData(clientData);
        } catch (error) {
            console.error('Error fetching client by user ID:', error);
            throw error;
        }
    }

    // Get all clients (Admin)
    async getAllClients(): Promise<IClientResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BASE, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all clients:', error);
            throw error;
        }
    }

    // Update client profile
    async updateClient(clientId: number, updateDto: IClientUpdateDto): Promise<IClientResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BY_ID(clientId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Profil güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Profil başarıyla güncellendi');
            return result;
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    }

    // Delete client (Admin)
    async deleteClient(clientId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.BY_ID(clientId), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Profil silinirken hata oluştu');
                throw new Error(error.message);
            }

            toast.success('Profil başarıyla silindi');
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }

    // Add education info
    async addEducationInfo(createDto: IEducationInfoCreateDto): Promise<IEducationInfoDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.EDUCATION, {
                method: 'POST',
                headers,
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Eğitim bilgisi eklenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            const eduData = result?.data || result;
            toast.success('Eğitim bilgisi başarıyla eklendi');
            return this.normalizeEducationInfo(eduData);
        } catch (error) {
            console.error('Error adding education info:', error);
            throw error;
        }
    }

    // Update education info
    async updateEducationInfo(educationInfoId: number, updateDto: IEducationInfoUpdateDto): Promise<IEducationInfoDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.EDUCATION_BY_ID(educationInfoId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Eğitim bilgisi güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            const eduData = result?.data || result;
            toast.success('Eğitim bilgisi başarıyla güncellendi');
            return this.normalizeEducationInfo(eduData);
        } catch (error) {
            console.error('Error updating education info:', error);
            throw error;
        }
    }

    // Delete education info
    async deleteEducationInfo(educationInfoId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.CLIENTS.EDUCATION_BY_ID(educationInfoId), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Eğitim bilgisi silinirken hata oluştu');
                throw new Error(error.message);
            }

            toast.success('Eğitim bilgisi başarıyla silindi');
        } catch (error) {
            console.error('Error deleting education info:', error);
            throw error;
        }
    }

    // Normalize education info data from backend (PascalCase) to frontend format (camelCase)
    private normalizeEducationInfo(data: any): IEducationInfoDto {
        if (!data) {
            return data;
        }

        return {
            id: data.id || data.Id,
            clientId: data.clientId || data.ClientId,
            level: data.level || data.Level || '',
            degree: data.degree || data.Degree || '',
            institution: data.institution || data.Institution || '',
            fieldOfStudy: data.fieldOfStudy || data.FieldOfStudy,
            startDate: data.startDate || data.StartDate,
            graduationDate: data.graduationDate || data.GraduationDate,
            country: data.country || data.Country,
            city: data.city || data.City,
            isCurrent: data.isCurrent ?? data.IsCurrent ?? false,
            gpa: data.gpa || data.GPA,
            description: data.description || data.Description,
            createdAt: data.createdAt || data.CreatedAt,
            updatedAt: data.updatedAt || data.UpdatedAt
        };
    }

    // Get education types (public endpoint - no auth required)
    async getEducationTypes(): Promise<IEducationTypeDto[]> {
        try {
            // Try with auth first (if user is logged in)
            let headers: HeadersInit = {};
            try {
                const authHeaders = await this.getAuthHeaders();
                headers = authHeaders;
            } catch {
                // No auth available - use public endpoint
                headers = { 'Content-Type': 'application/json' };
            }

            const response = await fetch(API_ROUTES.CLIENTS.EDUCATION_TYPES, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch education types');
            }

            const result = await response.json();
            // Handle response format: {success, data, count} or direct array
            const data = result?.data || result || [];
            // Map backend response (PascalCase) to frontend format (camelCase) with multi-language support
            return Array.isArray(data) ? data.map((et: any) => ({
                id: et.id || et.Id,
                code: et.code || et.Code || '',
                // Multi-language names
                name_TR: et.name_TR || et.Name_TR || et.name || '',
                name_EN: et.name_EN || et.Name_EN || et.nameEn || '',
                name_DE: et.name_DE || et.Name_DE || '',
                name_AR: et.name_AR || et.Name_AR || '',
                // Multi-language descriptions
                description_TR: et.description_TR || et.Description_TR || '',
                description_EN: et.description_EN || et.Description_EN || '',
                description_DE: et.description_DE || et.Description_DE || '',
                description_AR: et.description_AR || et.Description_AR || '',
                // Legacy fields for backward compatibility (default to TR)
                name: et.name_TR || et.Name_TR || et.name || '',
                nameEn: et.name_EN || et.Name_EN || et.nameEn || '',
                // Other fields
                isActive: et.isActive ?? et.IsActive ?? true,
                displayOrder: et.displayOrder || et.DisplayOrder || 0,
                iconName: et.iconName || et.IconName || ''
            })) : [];
        } catch (error) {
            console.error('Error fetching education types:', error);
            throw error;
        }
    }

    // Get pending client code information by client code (public endpoint - no auth required)
    async getPendingClientCodeByCode(clientCode: string): Promise<{
        clientCode: string;
        email: string;
        fullName: string;
        firstName: string;
        lastName: string;
        expirationDate: string;
        isUsed: boolean;
        isExpired: boolean;
        isValid: boolean;
        employeeSubmissionId?: number;
    } | null> {
        try {
            if (!clientCode || clientCode.trim() === '') {
                return null;
            }

            const response = await fetch(`${API_ROUTES.CLIENTS.BASE}/pending-code/${encodeURIComponent(clientCode)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Client code not found - this is OK, user can still register
                    return null;
                }
                const error = await response.json();
                console.warn('Error fetching pending client code:', error);
                return null;
            }

            const result = await response.json();
            const data = result?.data;
            
            if (!data) {
                return null;
            }

            return {
                clientCode: data.clientCode || clientCode,
                email: data.email || '',
                fullName: data.fullName || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                expirationDate: data.expirationDate || '',
                isUsed: data.isUsed || false,
                isExpired: data.isExpired || false,
                isValid: data.isValid || false,
                employeeSubmissionId: data.employeeSubmissionId
            };
        } catch (error) {
            console.warn('Error fetching pending client code:', error);
            return null;
        }
    }

    // Normalize client data from backend (PascalCase) to frontend format (camelCase)
    private normalizeClientData(data: any): IClientResponseDto {
        if (!data) {
            return data;
        }

        return {
            id: data.id || data.Id,
            userId: data.userId || data.UserId,
            userEmail: data.userEmail || data.UserEmail || data.email || data.Email,
            clientCode: data.clientCode || data.ClientCode || '',
            firstName: data.firstName || data.FirstName || '',
            lastName: data.lastName || data.LastName || '',
            fullName: data.fullName || data.FullName || `${data.firstName || data.FirstName || ''} ${data.lastName || data.LastName || ''}`.trim(),
            email: data.email || data.Email || '',
            phone: data.phone || data.Phone || '',
            address: data.address || data.Address,
            city: data.city || data.City,
            postalCode: data.postalCode || data.PostalCode,
            country: data.country || data.Country,
            dateOfBirth: data.dateOfBirth || data.DateOfBirth,
            age: data.age || data.Age,
            nationality: data.nationality || data.Nationality,
            passportNumber: data.passportNumber || data.PassportNumber,
            educationTypeId: data.educationTypeId || data.EducationTypeId,
            educationTypeName: data.educationTypeName || data.EducationTypeName,
            profilePictureUrl: data.profilePictureUrl || data.ProfilePictureUrl,
            notes: data.notes || data.Notes,
            status: data.status || data.Status || 'Active',
            registrationDate: data.registrationDate || data.RegistrationDate || data.createdAt || data.CreatedAt,
            createdAt: data.createdAt || data.CreatedAt,
            updatedAt: data.updatedAt || data.UpdatedAt,
            lastActivityAt: data.lastActivityAt || data.LastActivityAt,
            educationHistory: Array.isArray(data.educationHistory || data.EducationHistory) 
                ? (data.educationHistory || data.EducationHistory).map((edu: any) => ({
                    id: edu.id || edu.Id,
                    clientId: edu.clientId || edu.ClientId,
                    level: edu.level || edu.Level || '',
                    degree: edu.degree || edu.Degree || '',
                    institution: edu.institution || edu.Institution || '',
                    fieldOfStudy: edu.fieldOfStudy || edu.FieldOfStudy,
                    startDate: edu.startDate || edu.StartDate,
                    graduationDate: edu.graduationDate || edu.GraduationDate,
                    country: edu.country || edu.Country,
                    city: edu.city || edu.City,
                    isCurrent: edu.isCurrent ?? edu.IsCurrent ?? false,
                    gpa: edu.gpa || edu.GPA,
                    description: edu.description || edu.Description,
                    createdAt: edu.createdAt || edu.CreatedAt,
                    updatedAt: edu.updatedAt || edu.UpdatedAt
                }))
                : []
        };
    }
}

export default ClientService.getInstance();

