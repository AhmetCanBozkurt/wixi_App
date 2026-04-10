import { BASE_URL } from '../config/api.config';

export interface ICreatePaymentDto {
  amount: number;
  currency: string;
  type: string; // "Appointment"
  method: string; // "CreditCard"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIdentityNumber?: string;
  cardHolder: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: boolean;
  cardAlias?: string;
  cardToken?: string;
  cardUserKey?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  appointmentId?: number;
  applicationId?: number;
  customerCity?: string;
  customerCountry?: string;
  customerZipCode?: string;
  customerAddress?: string;
}

export interface IPaymentDto {
  id: number;
  paymentNumber: string;
  paymentProvider: string;
  providerPaymentId?: string;
  conversationId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIdentityNumber?: string;
  amount: number;
  paidAmount: number;
  currency: string;
  exchangeRate?: number;
  status: string;
  type: string;
  method: string;
  description?: string;
  notes?: string;
  appointmentId?: number;
  applicationId?: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  iyzicoPaymentId?: string;
  iyzicoConversationId?: string;
  iyzicoStatus?: string;
  iyzicoErrorCode?: string;
  iyzicoErrorMessage?: string;
  cardLastFourDigits?: string;
  cardHolderName?: string;
  cardBrand?: string;
  cardType?: string;
  installmentCount?: number;
  isInstallment: boolean;
  installmentNumber?: number;
  installmentAmount?: number;
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  expiresAt?: string;
  items: IPaymentItemDto[];
  transactions: IPaymentTransactionDto[];
  refunds: IPaymentRefundDto[];
}

export interface IPaymentItemDto {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface IPaymentTransactionDto {
  id: number;
  transactionId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IPaymentRefundDto {
  id: number;
  refundNumber: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  iyzicoRefundId?: string;
  createdAt: string;
  completedAt?: string;
  refundedByUserId?: number;
}

class PaymentService {
  private baseUrl = `${BASE_URL}/api/v1.0/payments`;

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  async createPayment(dto: ICreatePaymentDto): Promise<IPaymentDto> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ödeme oluşturulurken bir hata oluştu';
        try {
          const errorJson = JSON.parse(errorText);
          // Try to get error message from different possible locations
          errorMessage = errorJson.message || 
                        errorJson.data?.iyzicoErrorMessage || 
                        errorJson.data?.message ||
                        errorJson.errorMessage ||
                        errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const payment = result.data || result;
      
      // Check if payment failed even if response was OK
      if (payment && (payment.status === 'Failed' || payment.status === 'failed')) {
        let errorMessage = payment.iyzicoErrorMessage || payment.message || 'Ödeme işlemi başarısız oldu';
        
        // Add error code if available
        if (payment.iyzicoErrorCode) {
          errorMessage = `${errorMessage} (Hata Kodu: ${payment.iyzicoErrorCode})`;
        }
        
        throw new Error(errorMessage);
      }
      
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId: number): Promise<IPaymentDto> {
    try {
      const response = await fetch(`${this.baseUrl}/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ödeme yüklenirken bir hata oluştu';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  async getPaymentByNumber(paymentNumber: string): Promise<IPaymentDto> {
    try {
      const response = await fetch(`${this.baseUrl}/number/${paymentNumber}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ödeme yüklenirken bir hata oluştu';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error getting payment by number:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: number): Promise<{ status: string; amount: number; paidAmount: number; currency: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${paymentId}/status`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Ödeme durumu yüklenirken bir hata oluştu');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  async getPaymentsByAppointment(appointmentId: number): Promise<IPaymentDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/appointment/${appointmentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ödemeler yüklenirken bir hata oluştu';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Error getting payments by appointment:', error);
      throw error;
    }
  }

  async getAllPayments(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    paymentNumber?: string;
    customerEmail?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ data: IPaymentDto[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentNumber) queryParams.append('paymentNumber', params.paymentNumber);
      if (params?.customerEmail) queryParams.append('customerEmail', params.customerEmail);
      if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());

      const { TokenService } = await import('./TokenService');
      const token = await TokenService.getInstance().getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ödemeler yüklenirken bir hata oluştu';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.success ? result : { data: result.data || [], total: result.total || 0, page: result.page || 1, pageSize: result.pageSize || 20, totalPages: result.totalPages || 1 };
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;

