import { apiClient as axiosInstance } from '../../../shared/api/axiosConfig';
import type { MailTemplate, MailLog, SmtpSettings } from '../types';

export const mailingApi = {
  getTemplates: async () => {
    const response = await axiosInstance.get<{ items: MailTemplate[] }>('/mailing/templates');
    return response.data.items;
  },
  
  saveTemplate: async (template: Partial<MailTemplate>) => {
    const response = await axiosInstance.post<MailTemplate>('/mailing/templates', template);
    return response.data;
  },
  
  getLogs: async () => {
    const response = await axiosInstance.get<{ items: MailLog[] }>('/mailing/logs');
    return response.data.items;
  },

  getSmtpSettings: async () => {
    const response = await axiosInstance.get<SmtpSettings>('/mailing/smtp');
    return response.data;
  },

  updateSmtpSettings: async (settings: SmtpSettings) => {
    const response = await axiosInstance.put<{ success: boolean }>('/mailing/smtp', settings);
    return response.data.success;
  },

  sendTestMail: async (templateCode: string, testEmailAddress: string) => {
    const response = await axiosInstance.post<{ success: boolean }>('/mailing/test', {
      templateCode,
      testEmailAddress
    });
    return response.data.success;
  }
};
