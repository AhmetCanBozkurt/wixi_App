import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

// Contact Form Types
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age?: number;
  nationality?: string;
  education?: string;
  fieldOfStudy?: string;
  workExperience?: string;
  germanLevel?: string;
  englishLevel?: string;
  interest?: string;
  preferredCity?: string;
  timeline?: string;
  message?: string;
  privacyConsent: boolean;
  newsletter: boolean;
  language?: string;
}

// Employer Form Types
export interface EmployerFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  companySize?: string;
  positions: string;
  requirements: string;
  message?: string;
  specialRequests?: string;
  language?: string;
}

// Employee Form Types
export interface EmployeeFormData {
  salutation?: string;
  fullName: string;
  email: string;
  phone: string;
  profession?: string;
  experience?: number;
  education?: string;
  germanLevel?: string;
  additionalInfo?: string;
  specialRequests?: string;
  language?: string;
  cvFile?: File; // CV file for upload
}

// API Response
export interface FormSubmissionResponse {
  success: boolean;
  id?: number;
  message: string;
}

class FormService {
  private async submitForm<T>(endpoint: string, data: T): Promise<FormSubmissionResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Form submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }

  async getEmployeeSubmissions(params?: { page?: number; pageSize?: number; search?: string; profession?: string }) {
    const url = new URL(API_ROUTES.FORMS.LIST.EMPLOYEE);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.profession) url.searchParams.set('profession', params.profession);

    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch employee submissions');
    }
    return res.json();
  }

  async getEmployerSubmissions(params?: { page?: number; pageSize?: number; search?: string; industry?: string }) {
    const url = new URL(API_ROUTES.FORMS.LIST.EMPLOYER);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.industry) url.searchParams.set('industry', params.industry);

    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch employer submissions');
    }
    return res.json();
  }

  async getContactSubmissions(params?: { page?: number; pageSize?: number; search?: string; interest?: string }) {
    const url = new URL(API_ROUTES.FORMS.LIST.CONTACT);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.interest) url.searchParams.set('interest', params.interest);

    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch contact submissions');
    }
    return res.json();
  }

  async getEmployerSubmissionDetail(id: number) {
    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.FORMS.DETAIL.EMPLOYER(id), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch employer submission detail');
    }
    return res.json();
  }

  async submitContactForm(data: ContactFormData): Promise<FormSubmissionResponse> {
    return this.submitForm(API_ROUTES.FORMS.CONTACT, data);
  }

  async submitEmployerForm(data: EmployerFormData): Promise<FormSubmissionResponse> {
    return this.submitForm(API_ROUTES.FORMS.EMPLOYER, data);
  }

  async submitEmployeeForm(data: EmployeeFormData): Promise<FormSubmissionResponse> {
    try {
      // Use FormData for file upload support
      const formData = new FormData();
      
      if (data.salutation) formData.append('salutation', data.salutation);
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.profession) formData.append('profession', data.profession);
      if (data.experience !== undefined) formData.append('experience', data.experience.toString());
      if (data.education) formData.append('education', data.education);
      if (data.germanLevel) formData.append('germanLevel', data.germanLevel);
      if (data.additionalInfo) formData.append('additionalInfo', data.additionalInfo);
      if (data.specialRequests) formData.append('specialRequests', data.specialRequests);
      if (data.language) formData.append('language', data.language);
      
      // Add CV file if provided
      if (data.cvFile) {
        formData.append('cvFile', data.cvFile);
      }

      const response = await fetch(API_ROUTES.FORMS.EMPLOYEE, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Form submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }

  async getEmployeeSubmissionDetail(id: number) {
    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.FORMS.DETAIL.EMPLOYEE(id), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch employee submission detail');
    }
    return res.json();
  }

  async downloadEmployeeCv(employeeSubmissionId: number): Promise<Blob> {
    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_ROUTES.FORMS.CV_DOWNLOAD.EMPLOYEE(employeeSubmissionId), {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'CV indirilemedi');
    }

    return await res.blob();
  }

  async createClientFromEmployeeSubmission(employeeSubmissionId: number) {
    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = API_ROUTES.FORMS.CREATE_CLIENT_FROM_EMPLOYEE(employeeSubmissionId);
    console.log('Creating client from employee submission:', url);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}), // Empty body to satisfy API requirement
      credentials: 'include'
    });
    
    if (!res.ok) {
      let errorMessage = 'Failed to create client from employee submission';
      let errorData: any = null;
      
      try {
        errorData = await res.json();
        console.error('API Error Response:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // If there are additional error details, include them
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorDetails = Object.entries(errorData.errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          if (errorDetails) {
            errorMessage += ` (${errorDetails})`;
          }
        }
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorMessage = `${res.status} ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    return res.json();
  }

  async getPendingClientCodes(params: { page?: number; pageSize?: number; search?: string; status?: string }) {
    const token = await TokenService.getInstance().getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const url = `${API_ROUTES.FORMS.PENDING_CLIENT_CODES}?${queryParams.toString()}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Pending client codes could not be fetched');
    }
    
    return res.json();
  }
}

export default new FormService();

