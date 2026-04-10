import { API_ROUTES } from '../config/api.config';
import type {
    ISupportTicketCreateDto,
    ISupportTicketUpdateDto,
    ISupportTicketResponseDto,
    ISupportMessageCreateDto,
    ISupportMessageDto,
    ITicketAssignDto,
    ITicketStatusUpdateDto,
    IFAQDto,
    IFAQCreateDto,
    IFAQUpdateDto
} from '../types/SupportTypes';
import { TokenService } from './TokenService';
import { toast } from 'sonner';

class SupportService {
    private static instance: SupportService;
    private tokenService: TokenService;

    private constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): SupportService {
        if (!SupportService.instance) {
            SupportService.instance = new SupportService();
        }
        return SupportService.instance;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.tokenService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // === TICKET ENDPOINTS ===

    // Create ticket
    async createTicket(createDto: ISupportTicketCreateDto): Promise<ISupportTicketResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Destek talebi oluşturulurken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Destek talebi başarıyla oluşturuldu');
            return result;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    // Get ticket by ID
    async getTicketById(ticketId: number): Promise<ISupportTicketResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.BY_ID(ticketId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: ... }
            return result?.data || result;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw error;
        }
    }

    // Get client tickets
    async getClientTickets(clientId: number): Promise<ISupportTicketResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.CLIENT(clientId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: [...], count: ... }
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching client tickets:', error);
            throw error;
        }
    }

    // Get all tickets (Admin)
    async getAllTickets(): Promise<ISupportTicketResponseDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.BASE, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: [...], count: ... }
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching all tickets:', error);
            throw error;
        }
    }

    // Update ticket (Admin)
    async updateTicket(ticketId: number, updateDto: ISupportTicketUpdateDto): Promise<ISupportTicketResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.BY_ID(ticketId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Destek talebi güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Destek talebi başarıyla güncellendi');
            return result;
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw error;
        }
    }

    // Assign ticket (Admin)
    async assignTicket(ticketId: number, assignDto: ITicketAssignDto): Promise<ISupportTicketResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.ASSIGN(ticketId), {
                method: 'POST',
                headers,
                body: JSON.stringify(assignDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Destek talebi atanırken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Destek talebi başarıyla atandı');
            return result;
        } catch (error) {
            console.error('Error assigning ticket:', error);
            throw error;
        }
    }

    // Update ticket status (Admin)
    async updateTicketStatus(ticketId: number, statusDto: ITicketStatusUpdateDto): Promise<ISupportTicketResponseDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.TICKETS.STATUS(ticketId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(statusDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Durum güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('Durum başarıyla güncellendi');
            return result;
        } catch (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
    }

    // === MESSAGE ENDPOINTS ===

    // Add message
    async addMessage(createDto: ISupportMessageCreateDto): Promise<ISupportMessageDto> {
        try {
            const headers = await this.getAuthHeaders();
            // Backend expects: ticketId, message, isFromClient (senderId is taken from token)
            const response = await fetch(API_ROUTES.SUPPORT.MESSAGES.BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ticketId: createDto.ticketId,
                    message: createDto.messageText, // Backend expects "message" field
                    isFromClient: true // Client users always send as client
                })
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Mesaj gönderilirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            const messageData = result?.data || result;
            // Normalize response to match frontend interface
            return {
                id: messageData.id || messageData.Id,
                ticketId: messageData.ticketId || messageData.TicketId,
                senderId: messageData.senderId || messageData.SenderId,
                senderName: messageData.senderName || messageData.SenderName || 'Unknown',
                senderRole: messageData.senderRole || messageData.SenderRole || 'Client',
                messageText: messageData.message || messageData.Message || messageData.messageText || '',
                sentAt: messageData.createdAt || messageData.CreatedAt || messageData.sentAt || new Date().toISOString(),
                isRead: messageData.isRead ?? messageData.IsRead ?? false
            };
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }

    // Get ticket messages
    async getTicketMessages(ticketId: number): Promise<ISupportMessageDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.MESSAGES.BY_TICKET(ticketId), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: [...], count: ... }
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching ticket messages:', error);
            throw error;
        }
    }

    // === FAQ ENDPOINTS ===

    // Get all FAQs
    async getAllFAQs(): Promise<IFAQDto[]> {
        try {
            const response = await fetch(API_ROUTES.SUPPORT.FAQ.BASE, {
                method: 'GET'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: [...], count: ... }
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            throw error;
        }
    }

    // Get FAQs by category
    async getFAQsByCategory(category: string): Promise<IFAQDto[]> {
        try {
            const response = await fetch(API_ROUTES.SUPPORT.FAQ.BY_CATEGORY(category), {
                method: 'GET'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            // Handle API response format { success: true, data: [...], count: ... }
            return result?.data || result || [];
        } catch (error) {
            console.error('Error fetching FAQs by category:', error);
            throw error;
        }
    }

    // Create FAQ (Admin)
    async createFAQ(createDto: IFAQCreateDto): Promise<IFAQDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.FAQ.BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(createDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'SSS oluşturulurken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('SSS başarıyla oluşturuldu');
            return result;
        } catch (error) {
            console.error('Error creating FAQ:', error);
            throw error;
        }
    }

    // Update FAQ (Admin)
    async updateFAQ(faqId: number, updateDto: IFAQUpdateDto): Promise<IFAQDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.FAQ.BY_ID(faqId), {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateDto)
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'SSS güncellenirken hata oluştu');
                throw new Error(error.message);
            }

            const result = await response.json();
            toast.success('SSS başarıyla güncellendi');
            return result;
        } catch (error) {
            console.error('Error updating FAQ:', error);
            throw error;
        }
    }

    // Delete FAQ (Admin)
    async deleteFAQ(faqId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(API_ROUTES.SUPPORT.FAQ.BY_ID(faqId), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'SSS silinirken hata oluştu');
                throw new Error(error.message);
            }

            toast.success('SSS başarıyla silindi');
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            throw error;
        }
    }
}

export default SupportService.getInstance();

