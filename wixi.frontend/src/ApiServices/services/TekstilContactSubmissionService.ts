import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ContactSubmissionDto,
  CreateContactSubmissionDto,
  UpdateContactSubmissionDto,
  TekstilApiResponse,
  TekstilPaginatedResponse,
} from '../types/TekstilTypes';

class TekstilContactSubmissionService {
  /**
   * Create contact submission (public)
   */
  async createContactSubmission(submission: CreateContactSubmissionDto): Promise<{ success: boolean; data: ContactSubmissionDto | null; message?: string }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit contact form');
      }

      const result: TekstilApiResponse<ContactSubmissionDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message || 'Contact form submitted successfully',
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all contact submissions with pagination (admin only)
   */
  async getAllContactSubmissions(
    page: number = 1, 
    pageSize: number = 10,
    status?: 'New' | 'InProgress' | 'Resolved' | 'Closed',
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  ): Promise<{ success: boolean; data: TekstilPaginatedResponse<ContactSubmissionDto> | null }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions');
      }

      const result: TekstilApiResponse<TekstilPaginatedResponse<ContactSubmissionDto>> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get contact submission by ID (admin only)
   */
  async getContactSubmissionById(id: number): Promise<{ success: boolean; data: ContactSubmissionDto | null }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact submission');
      }

      const result: TekstilApiResponse<ContactSubmissionDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching contact submission:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Update contact submission (admin only)
   */
  async updateContactSubmission(id: number, submission: UpdateContactSubmissionDto): Promise<{ success: boolean; data: ContactSubmissionDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contact submission');
      }

      const result: TekstilApiResponse<ContactSubmissionDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error updating contact submission:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete contact submission (admin only)
   */
  async deleteContactSubmission(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contact submission');
      }

      return {
        success: true,
        message: 'Contact submission deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Assign contact submission to user (admin only)
   */
  async assignContactSubmission(id: number, userId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign contact submission');
      }

      return {
        success: true,
        message: 'Contact submission assigned successfully',
      };
    } catch (error) {
      console.error('Error assigning contact submission:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Respond to contact submission (admin only)
   */
  async respondToContactSubmission(id: number, responseMessage: string): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_SUBMISSIONS}/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ responseMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to contact submission');
      }

      return {
        success: true,
        message: 'Response sent successfully',
      };
    } catch (error) {
      console.error('Error responding to contact submission:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilContactSubmissionService();


