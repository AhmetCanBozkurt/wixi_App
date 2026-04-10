import { API_ROUTES } from '../config/api.config';
import type {
    IDocumentUploadDto,
    IDocumentResponseDto,
    IDocumentTypeDto,
    IClientDocumentListDto,
    IDocumentReviewDto,
    IDocumentReviewStatistics
} from '../types/DocumentTypes';
import { TokenService } from './TokenService';
import { toast } from 'sonner';

type DocumentTypePayload = Partial<IDocumentTypeDto> & {
    code: string;
    name_TR: string;
    name_EN: string;
    name_DE: string;
    name_AR: string;
};

class DocumentService {
    private static instance: DocumentService;
    private tokenService: TokenService;

    private constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): DocumentService {
        if (!DocumentService.instance) {
            DocumentService.instance = new DocumentService();
        }
        return DocumentService.instance;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.tokenService.getToken();
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    private async getJsonHeaders(): Promise<HeadersInit> {
        const headers = await this.getAuthHeaders();
        return {
            ...headers,
            'Content-Type': 'application/json'
        };
    }

    // Upload document
    async uploadDocument(file: File, uploadDto: IDocumentUploadDto): Promise<IDocumentResponseDto> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('clientId', uploadDto.clientId.toString());
            formData.append('documentTypeId', uploadDto.documentTypeId.toString());

            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENTS.UPLOAD, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                let errorMessage = 'Belge yüklenirken hata oluştu';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (parseError) {
                    // If JSON parse fails, try to get text
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch (textError) {
                        // If text parse also fails, use default message
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }
                }
                
                // Show toast error message
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const documentData = result?.data || result;
            toast.success('Belge başarıyla yüklendi');
            return documentData;
        } catch (error: any) {
            console.error('Error uploading document:', error);
            
            // If error was already thrown with message, don't show duplicate toast
            // Only show toast if it's an unexpected error
            if (!error.message || (!error.message.includes('File type') && !error.message.includes('not allowed'))) {
                toast.error(error.message || 'Belge yüklenirken beklenmeyen bir hata oluştu');
            }
            
            throw error;
        }
    }

    // Get client documents
    async getClientDocuments(clientId: number, lang?: string): Promise<IClientDocumentListDto> {
        try {
            const headers = await this.getAuthHeaders();
            const endpoint = lang
                ? `${API_ROUTES.DOCUMENTS.CLIENT(clientId)}?lang=${encodeURIComponent(lang)}`
                : API_ROUTES.DOCUMENTS.CLIENT(clientId);
            const response = await fetch(endpoint, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Belgeler yüklenirken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                console.error('Error fetching client documents:', errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            // Backend returns: { success: true, data: { documents: [...], totalDocuments: ..., ... } }
            const documentsData = result?.data || result;
            return documentsData;
        } catch (error) {
            console.error('Error fetching client documents:', error);
            throw error;
        }
    }

    // Get document by ID
    async getDocumentById(documentId: number): Promise<IDocumentResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENTS.BY_ID(documentId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching document:', error);
            throw error;
        }
    }

    // Delete document
    async deleteDocument(documentId: number, clientId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_ROUTES.DOCUMENTS.BY_ID(documentId)}?clientId=${clientId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Belge silinirken hata oluştu');
                throw new Error(error.message);
            }

            toast.success('Belge başarıyla silindi');
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    // Get all document types
    async getAllDocumentTypes(lang?: string): Promise<IDocumentTypeDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const endpoint = lang
                ? `${API_ROUTES.DOCUMENTS.TYPES}?lang=${encodeURIComponent(lang)}`
                : API_ROUTES.DOCUMENTS.TYPES;
            const response = await fetch(endpoint, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle response format: { success: true, data: [...] } or direct array
            const data = result?.data || result || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching document types:', error);
            throw error;
        }
    }

    // Get document types by education type
    async getDocumentTypesByEducation(educationTypeId: number, lang?: string): Promise<IDocumentTypeDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const endpoint = lang
                ? `${API_ROUTES.DOCUMENTS.TYPES_BY_EDUCATION(educationTypeId)}?lang=${encodeURIComponent(lang)}`
                : API_ROUTES.DOCUMENTS.TYPES_BY_EDUCATION(educationTypeId);
            const response = await fetch(endpoint, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle response format: { success: true, data: [...] } or direct array
            const data = result?.data || result || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching document types by education:', error);
            throw error;
        }
    }

    // === ADMIN DOCUMENT TYPE MANAGEMENT ===
    async createDocumentType(payload: DocumentTypePayload): Promise<IDocumentTypeDto> {
        const headers = await this.getJsonHeaders();
        const response = await fetch(API_ROUTES.DOCUMENTS.ADMIN.TYPES, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const result = await this.handleDocumentTypeResponse(response, 'Belge türü oluşturulurken hata oluştu');
        toast.success('Belge türü başarıyla oluşturuldu');
        return result;
    }

    async updateDocumentType(id: number, payload: DocumentTypePayload): Promise<IDocumentTypeDto> {
        const headers = await this.getJsonHeaders();
        const response = await fetch(API_ROUTES.DOCUMENTS.ADMIN.BY_ID(id), {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        const result = await this.handleDocumentTypeResponse(response, 'Belge türü güncellenirken hata oluştu');
        toast.success('Belge türü başarıyla güncellendi');
        return result;
    }

    async deleteDocumentType(id: number): Promise<void> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(API_ROUTES.DOCUMENTS.ADMIN.BY_ID(id), {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            let errorMessage = 'Belge türü silinirken hata oluştu';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                // ignore parse errors
            }
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        toast.success('Belge türü başarıyla silindi');
    }

    private async handleDocumentTypeResponse(response: Response, fallbackMessage: string): Promise<IDocumentTypeDto> {
        if (!response.ok) {
            let errorMessage = fallbackMessage;
            try {
                const error = await response.json();
                errorMessage = error.message || fallbackMessage;
            } catch {
                // ignore parse errors
            }
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result?.data || result;
    }

    // Download document
    async downloadDocument(documentId: number): Promise<Blob> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENTS.DOWNLOAD(documentId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Belge indirilirken hata oluştu');
                throw new Error(error.message);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    }

    // === ADMIN ENDPOINTS ===

    // Get pending documents for review
    async getPendingDocuments(): Promise<IDocumentResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENT_REVIEW.PENDING, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle response format: { success: true, data: [...] } or direct array
            const data = result?.data || result || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching pending documents:', error);
            throw error;
        }
    }

    // Get documents by status
    async getDocumentsByStatus(status: string): Promise<IDocumentResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENT_REVIEW.BY_STATUS(status), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle response format: { success: true, data: [...] } or direct array
            const data = result?.data || result || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching documents by status:', error);
            throw error;
        }
    }

    // Review document (Admin)
    async reviewDocument(documentId: number, reviewDto: IDocumentReviewDto): Promise<IDocumentResponseDto> {
        try {
            const headers = {
                ...await this.getAuthHeaders(),
                'Content-Type': 'application/json'
            };
            
            const response = await fetch(API_ROUTES.DOCUMENT_REVIEW.REVIEW(documentId), {
                method: 'POST',
                headers,
                body: JSON.stringify(reviewDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Belge incelenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Belge başarıyla incelendi');
            return result;
        } catch (error) {
            console.error('Error reviewing document:', error);
            throw error;
        }
    }

    // Get review statistics
    async getReviewStatistics(): Promise<IDocumentReviewStatistics> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENT_REVIEW.STATISTICS, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Endpoint not found, return empty stats
                    return {
                        totalDocuments: 0,
                        pendingForReview: 0,
                        accepted: 0,
                        rejected: 0,
                        missingInfo: 0
                    };
                }
                const text = await response.text();
                let error;
                try {
                    error = JSON.parse(text);
                } catch {
                    error = { message: text || 'Unknown error' };
                }
                throw new Error(error.message || error.error || 'Failed to fetch statistics');
            }

            const result = await response.json();
            // Backend returns { success: true, data: stats }
            const statsData = result.data || result;
            return statsData;
        } catch (error) {
            console.error('Error fetching review statistics:', error);
            // Return empty stats on error instead of throwing
            return {
                totalDocuments: 0,
                pendingForReview: 0,
                accepted: 0,
                rejected: 0,
                missingInfo: 0
            };
        }
    }

    // Get document review history
    async getDocumentReviewHistory(documentId: number): Promise<IDocumentReviewDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.DOCUMENT_REVIEW.HISTORY(documentId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching document review history:', error);
            throw error;
        }
    }

    // Admin uploads document for client (e.g., Denklik Belgesi)
    async uploadDocumentForClient(
        clientId: number, 
        documentTypeCode: string, 
        file: File, 
        notes?: string
    ): Promise<IDocumentResponseDto> {
        try {
            const formData = new FormData();
            formData.append('clientId', clientId.toString());
            formData.append('documentTypeCode', documentTypeCode);
            formData.append('file', file);
            if (notes) {
                formData.append('notes', notes);
            }

            const token = await this.tokenService.getToken();
            const headers: Record<string, string> = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_ROUTES.DOCUMENT_REVIEW.BASE}/upload-for-client`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(errorData.message || 'Belge yüklenirken hata oluştu');
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error uploading document for client:', error);
            throw error;
        }
    }
}

export default DocumentService.getInstance();

