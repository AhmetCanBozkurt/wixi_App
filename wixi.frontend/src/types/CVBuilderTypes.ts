// CV Builder Type Definitions
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certificates: Certificate[];
}

// API DTOs
export interface SaveCVDataDto {
  sessionId?: string;
  paymentId?: number;
  documentId?: number;
  personalInfo: PersonalInfo | string;  // Can be object or JSON string
  experience: Experience[] | string;     // Can be array or JSON string
  education: Education[] | string;       // Can be array or JSON string
  skills: Skill[] | string;             // Can be array or JSON string
  languages: Language[] | string;       // Can be array or JSON string
  certificates: Certificate[] | string; // Can be array or JSON string
}

export interface CVDataDto {
  id: number;
  paymentId?: number;
  clientId?: number;
  documentId?: number;
  sessionId?: string;
  personalInfo: PersonalInfo | string;  // Can be object or JSON string
  experience: Experience[] | string;     // Can be array or JSON string
  education: Education[] | string;      // Can be array or JSON string
  skills: Skill[] | string;             // Can be array or JSON string
  languages: Language[] | string;       // Can be array or JSON string
  certificates: Certificate[] | string;  // Can be array or JSON string
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAnalysisDto {
  id: number;
  documentId: number;
  isCV: boolean;
  atsScore?: number;
  recommendations?: string[];
  analysisMethod: string;
  analyzedAt: string;
}

