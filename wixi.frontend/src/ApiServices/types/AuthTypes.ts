export interface ILoginDto {
    email: string;
    password: string;
    twoFactorCode?: string;
}

export interface IEducationInfoDto {
    level: string;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    graduationDate?: string;
    country?: string;
    isCurrent: boolean;
    description?: string;
    gpa?: number;
}

export interface IRegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    clientCode?: string; // Optional - müşteri kodu
    phone?: string;
    dateOfBirth?: string; // ISO date string
    address?: string;
    nationality?: string;
    educationTypeId?: number;
    educationHistory?: IEducationInfoDto[];
}

export interface ITokenDto {
    accessToken: string;
    accessTokenExpiration: Date;
    refreshToken: string;
    refreshTokenExpiration: Date;
    requiresTwoFactor: boolean;
    email: string;
}

export interface IEnable2FADto {
    email: string;
    password: string;
}

export interface IVerify2FADto {
    email: string;
    code: string;
}

export interface ICurrentUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

