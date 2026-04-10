// ============================================
// TEKSTIL MODULE TYPES
// ============================================

// ============================================
// Language Types
// ============================================

export interface LanguageDto {
  id?: number;
  code: string;
  name: string;
  nativeName?: string;
  flagIcon?: string;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateLanguageDto {
  code: string;
  name: string;
  nativeName?: string;
  flagIcon?: string;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateLanguageDto {
  id: number;
  code?: string;
  name?: string;
  nativeName?: string;
  flagIcon?: string;
  isDefault?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

// ============================================
// About Types
// ============================================

export interface AboutTranslationDto {
  languageCode: string;
  title?: string;
  description?: string;
  missionTitle?: string;
  missionDescription?: string;
  visionTitle?: string;
  visionDescription?: string;
}

export interface AboutDto {
  id?: number;
  title: string;
  description: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  isActive: boolean;
  displayOrder: number;
  translations?: AboutTranslationDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAboutDto {
  title: string;
  description: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  isActive: boolean;
  displayOrder: number;
  translations?: AboutTranslationDto[];
}

export interface UpdateAboutDto {
  id: number;
  title?: string;
  description?: string;
  missionTitle?: string;
  missionDescription?: string;
  visionTitle?: string;
  visionDescription?: string;
  isActive?: boolean;
  displayOrder?: number;
  translations?: AboutTranslationDto[];
}

// ============================================
// Stats Types
// ============================================

export interface StatTranslationDto {
  languageCode: string;
  label?: string;
  value?: string;
}

export interface StatDto {
  id?: number;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  translations?: StatTranslationDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStatDto {
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  translations?: StatTranslationDto[];
}

export interface UpdateStatDto {
  id: number;
  iconName?: string;
  displayOrder?: number;
  isActive?: boolean;
  translations?: StatTranslationDto[];
}

// ============================================
// Product Category Types
// ============================================

export interface ProductCategoryTranslationDto {
  languageCode: string;
  name?: string;
  description?: string;
}

export interface ProductCategoryDto {
  id?: number;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  translations?: ProductCategoryTranslationDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductCategoryDto {
  slug: string;
  displayOrder: number;
  isActive: boolean;
  translations?: ProductCategoryTranslationDto[];
}

export interface UpdateProductCategoryDto {
  id: number;
  slug?: string;
  displayOrder?: number;
  isActive?: boolean;
  translations?: ProductCategoryTranslationDto[];
}

// ============================================
// Product Types
// ============================================

export interface ProductTranslationDto {
  languageCode: string;
  title?: string;
  description?: string;
  shortDescription?: string;
}

export interface ProductImageDto {
  id?: number;
  productId?: number;
  imageUrl: string;
  imageAlt?: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface ProductDto {
  id?: number;
  productCategoryId: number;
  productCategory?: ProductCategoryDto;
  slug: string;
  imageUrl: string;
  imageAlt?: string;
  price?: number;
  minOrderQuantity?: number;
  features?: string; // JSON string
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  viewCount: number;
  translations?: ProductTranslationDto[];
  images?: ProductImageDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  productCategoryId: number;
  slug: string;
  imageUrl: string;
  imageAlt?: string;
  price?: number;
  minOrderQuantity?: number;
  features?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  translations?: ProductTranslationDto[];
  images?: ProductImageDto[];
}

export interface UpdateProductDto {
  id: number;
  productCategoryId?: number;
  slug?: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: number;
  minOrderQuantity?: number;
  features?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  translations?: ProductTranslationDto[];
  images?: ProductImageDto[];
}

// ============================================
// Project Category Types
// ============================================

export interface ProjectCategoryTranslationDto {
  languageCode: string;
  name?: string;
}

export interface ProjectCategoryDto {
  id?: number;
  slug: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  translations?: ProjectCategoryTranslationDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectCategoryDto {
  slug: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  translations?: ProjectCategoryTranslationDto[];
}

export interface UpdateProjectCategoryDto {
  id: number;
  slug?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
  translations?: ProjectCategoryTranslationDto[];
}

// ============================================
// Project Types
// ============================================

export interface ProjectTranslationDto {
  languageCode: string;
  title?: string;
  description?: string;
}

export interface ProjectImageDto {
  id?: number;
  projectId?: number;
  imageUrl: string;
  imageAlt?: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface ProjectTagDto {
  id?: number;
  projectId?: number;
  tagName: string;
  createdAt?: string;
}

export interface ProjectDto {
  id?: number;
  projectCategoryId: number;
  projectCategory?: ProjectCategoryDto;
  slug: string;
  clientName?: string;
  imageUrl: string;
  imageAlt?: string;
  year?: number;
  quantity?: number;
  duration?: string;
  completionDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  viewCount: number;
  translations?: ProjectTranslationDto[];
  images?: ProjectImageDto[];
  tags?: ProjectTagDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  projectCategoryId: number;
  slug: string;
  clientName?: string;
  imageUrl: string;
  imageAlt?: string;
  year?: number;
  quantity?: number;
  duration?: string;
  completionDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  translations?: ProjectTranslationDto[];
  images?: ProjectImageDto[];
  tags?: ProjectTagDto[];
}

export interface UpdateProjectDto {
  id: number;
  projectCategoryId?: number;
  slug?: string;
  clientName?: string;
  imageUrl?: string;
  imageAlt?: string;
  year?: number;
  quantity?: number;
  duration?: string;
  completionDate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  translations?: ProjectTranslationDto[];
  images?: ProjectImageDto[];
  tags?: ProjectTagDto[];
}

// ============================================
// Contact Info Types
// ============================================

export interface ContactInfoTranslationDto {
  languageCode: string;
  workingHoursWeekday?: string;
  workingHoursSaturday?: string;
  workingHoursSunday?: string;
  whatsAppMessage?: string;
}

export interface ContactInfoDto {
  id?: number;
  companyName: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
  mapLatitude?: number;
  mapLongitude?: number;
  mapZoomLevel: number;
  whatsAppNumber?: string;
  socialMediaLinks?: string; // JSON string
  isActive: boolean;
  translations?: ContactInfoTranslationDto[];
  updatedAt?: string;
}

export interface CreateContactInfoDto {
  companyName: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
  mapLatitude?: number;
  mapLongitude?: number;
  mapZoomLevel: number;
  whatsAppNumber?: string;
  socialMediaLinks?: string;
  isActive: boolean;
  translations?: ContactInfoTranslationDto[];
}

export interface UpdateContactInfoDto {
  id: number;
  companyName?: string;
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  mapLatitude?: number;
  mapLongitude?: number;
  mapZoomLevel?: number;
  whatsAppNumber?: string;
  socialMediaLinks?: string;
  isActive?: boolean;
  translations?: ContactInfoTranslationDto[];
}

// ============================================
// Contact Submission Types
// ============================================

export interface ContactSubmissionDto {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'New' | 'InProgress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: number;
  assignedAt?: string;
  responseMessage?: string;
  responseDate?: string;
  responseBy?: number;
  followUpDate?: string;
  tags?: string;
  source: string;
  languageCode: string;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactSubmissionDto {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: string;
  languageCode: string;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
}

export interface UpdateContactSubmissionDto {
  id: number;
  status?: 'New' | 'InProgress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: number;
  responseMessage?: string;
  followUpDate?: string;
  tags?: string;
}

// ============================================
// API Response Types
// ============================================

export interface TekstilApiResponse<T> {
  value: T;
  count?: number;
  isSuccess: boolean;
  message?: string;
}

export interface TekstilPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}


