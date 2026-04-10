import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';

export interface IAppointmentDto {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    clientId?: number;
    status: string;
    color: string;
    createdById?: number;
    createdByName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ICreateAppointmentDto {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    clientId?: number;
    status?: string;
    color?: string;
}

export interface ICreateHolidayDto {
    name: string;
    date: string;
    isRecurring?: boolean;
    countryCode?: string;
}

export interface IUpdateHolidayDto {
    name?: string;
    date?: string;
    isRecurring?: boolean;
    countryCode?: string;
}

export interface IUpdateAppointmentDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientId?: number;
    status?: string;
    color?: string;
}

export interface IHolidayDto {
    id: number;
    name: string;
    date: string;
    isRecurring: boolean;
    countryCode: string;
    createdAt: string;
}

class AppointmentService {
    private baseUrl = `${BASE_URL}/api/v1.0/appointments`;

    private async getAuthHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        try {
            const token = await TokenService.getInstance().getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            // Token yoksa public endpoint olarak devam et
            console.warn('No token available for appointment request');
        }

        return headers;
    }

    async createAppointment(dto: ICreateAppointmentDto): Promise<IAppointmentDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevu oluşturulurken bir hata oluştu';
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
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async getAppointments(startDate?: Date, endDate?: Date): Promise<IAppointmentDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const params = new URLSearchParams();
            if (startDate) {
                params.append('startDate', startDate.toISOString());
            }
            if (endDate) {
                params.append('endDate', endDate.toISOString());
            }

            const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevular yüklenirken bir hata oluştu';
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
            console.error('Error getting appointments:', error);
            throw error;
        }
    }

    async getAppointmentsByRange(startDate: Date, endDate: Date): Promise<IAppointmentDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const params = new URLSearchParams();
            params.append('startDate', startDate.toISOString());
            params.append('endDate', endDate.toISOString());

            const response = await fetch(`${this.baseUrl}/range?${params.toString()}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevular yüklenirken bir hata oluştu';
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
            console.error('Error getting appointments by range:', error);
            throw error;
        }
    }

    async getAppointmentById(appointmentId: number): Promise<IAppointmentDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/${appointmentId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevu yüklenirken bir hata oluştu';
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
            console.error('Error getting appointment:', error);
            throw error;
        }
    }

    async updateAppointment(appointmentId: number, dto: IUpdateAppointmentDto): Promise<IAppointmentDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/${appointmentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevu güncellenirken bir hata oluştu';
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
            console.error('Error updating appointment:', error);
            throw error;
        }
    }

    async deleteAppointment(appointmentId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/${appointmentId}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Randevu silinirken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }

    async getHolidays(startDate?: Date, endDate?: Date): Promise<IHolidayDto[]> {
        try {
            const headers = await this.getAuthHeaders();
            const params = new URLSearchParams();
            if (startDate) {
                params.append('startDate', startDate.toISOString());
            }
            if (endDate) {
                params.append('endDate', endDate.toISOString());
            }

            const url = params.toString() 
                ? `${this.baseUrl}/holidays?${params.toString()}` 
                : `${this.baseUrl}/holidays`;
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Tatiller yüklenirken bir hata oluştu';
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
            console.error('Error getting holidays:', error);
            throw error;
        }
    }

    async createHoliday(dto: ICreateHolidayDto): Promise<IHolidayDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/holidays`, {
                method: 'POST',
                headers,
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Tatil oluşturulurken bir hata oluştu';
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
            console.error('Error creating holiday:', error);
            throw error;
        }
    }

    async updateHoliday(holidayId: number, dto: IUpdateHolidayDto): Promise<IHolidayDto> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/holidays/${holidayId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Tatil güncellenirken bir hata oluştu';
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
            console.error('Error updating holiday:', error);
            throw error;
        }
    }

    async deleteHoliday(holidayId: number): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.baseUrl}/holidays/${holidayId}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Tatil silinirken bir hata oluştu';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting holiday:', error);
            throw error;
        }
    }
}

export const appointmentService = new AppointmentService();
export default appointmentService;

