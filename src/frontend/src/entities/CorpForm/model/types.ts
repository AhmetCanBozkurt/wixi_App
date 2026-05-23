export interface WebFormListItem {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  notifyEmail?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface WebForm extends WebFormListItem {
  fieldsJson?: string | null;
  submitButtonText: string;
  successMessage?: string | null;
  updatedAt?: string | null;
}

export interface WebFormSubmission {
  id: string;
  formId: string;
  tenantId: string;
  dataJson?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}
