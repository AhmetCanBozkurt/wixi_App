// Client Profile Types

export interface IClientCreateDto {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    educationTypeId?: number;
}

export interface IClientUpdateDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    educationTypeId?: number;
}

export interface IClientResponseDto {
    id: number;
    userId: number;
    userEmail: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    age?: number;
    nationality?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    passportNumber?: string;
    clientCode: string;
    registrationDate: string;
    status: string;
    educationTypeId?: number;
    educationTypeName?: string;
    profilePictureUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    lastActivityAt?: string;
    educationHistory: IEducationInfoDto[];
}

export interface IEducationInfoDto {
    id: number;
    clientId: number;
    level: string; // HighSchool, Bachelor, Master, PhD, etc.
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    graduationDate?: string;
    country?: string;
    city?: string;
    isCurrent: boolean;
    description?: string;
    gpa?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IEducationInfoCreateDto {
    clientId: number;
    level: string;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    graduationDate?: string;
    country?: string;
    city?: string;
    isCurrent: boolean;
    description?: string;
    gpa?: number;
}

export interface IEducationInfoUpdateDto {
    level: string;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    graduationDate?: string;
    country?: string;
    city?: string;
    isCurrent: boolean;
    description?: string;
    gpa?: number;
}

export interface IEducationTypeDto {
    id: number;
    code: string;
    // Multi-language names (4 languages: TR, EN, DE, AR)
    name_TR: string;
    name_EN: string;
    name_DE: string;
    name_AR: string;
    // Multi-language descriptions
    description_TR?: string;
    description_EN?: string;
    description_DE?: string;
    description_AR?: string;
    // Legacy fields for backward compatibility (computed from name_TR)
    name?: string;
    nameEn?: string;
    // Other fields
    isActive: boolean;
    displayOrder: number;
    iconName?: string;
}

