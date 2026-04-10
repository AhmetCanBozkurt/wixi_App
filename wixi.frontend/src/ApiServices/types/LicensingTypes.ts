// Tenant Types
export interface TenantDto {
  tenantId: number;
  companyName: string;
  domain?: string;
  status: string;
  createDate: string;
  updatedDate?: string;
  updatedBy?: string;
  licenseCount?: number;
}

export interface CreateTenantDto {
  companyName: string;
  domain?: string;
  status?: string;
}

export interface UpdateTenantDto {
  companyName: string;
  domain?: string;
  status?: string;
}

// License Types
export interface LicenseDto {
  licenseId: number;
  tenantId?: number;
  tenantCompanyName?: string;
  licenseKey?: string;
  expireDate?: string;
  isActive: boolean;
  planName?: string;
  maxUser?: number;
  allowedModules?: string[];
  machineBindingMode?: string;
  notes?: string;
  createDate: string;
  updatedDate?: string;
  createdBy?: string;
  updatedBy?: string;
  isExpired: boolean;
  isValid: boolean;
}

export interface CreateLicenseDto {
  licenseKey: string;
  tenantId?: number;
  expireDate?: string;
  isActive?: boolean;
  planName?: string;
  maxUser?: number;
  allowedModules?: string[];
  machineBindingMode?: string;
  notes?: string;
}

export interface AssignLicenseDto {
  licenseId: number;
  tenantId: number;
}

export interface ValidateLicenseRequestDto {
  licenseKey: string;
  machineCode?: string;
  clientVersion?: string;
}

export interface ValidateLicenseResponseDto {
  isValid: boolean;
  expireDate?: string;
  modules?: string[];
  maxUser?: number;
  tenantId?: number;
  tenantCompanyName?: string;
  reason?: string;
}

