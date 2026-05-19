export interface MailTemplate extends Record<string, unknown> {
  id: string;
  code: string;
  subject: string;
  body: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUser?: string;
  updatedByUser?: string;
}

export interface MailLog extends Record<string, unknown> {
  id: string;
  templateCode?: string;
  recipient: string;
  subject: string;
  body: string;
  isSuccess: boolean;
  errorMessage?: string;
  sentAt: string;
  createdByUser?: string;
}

export interface SmtpSettings {
  server: string;
  port: number;
  username: string;
  password?: string; // Optional for updates
  senderName: string;
  senderEmail: string;
  enableSsl: boolean;
}
