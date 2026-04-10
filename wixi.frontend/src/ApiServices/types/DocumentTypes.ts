// Document Management Types

export interface IDocumentUploadDto {
    clientId: number;
    documentTypeId: number;
}

export interface IDocumentResponseDto {
    id: number;
    clientId: number;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCode?: string;
    documentTypeId: number;
    documentTypeName?: string;
    originalFileName: string;
    filePath: string;
    fileSizeBytes: number;
    fileSizeFormatted?: string;
    fileExtension: string;
    status: string;
    version: number;
    uploadedAt: string;
    hasReview?: boolean;
    reviewDecision?: string;
    feedbackMessage?: string;
    reviewedAt?: string;
}

export interface IDocumentTypeDto {
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
    // Multi-language notes
    note_TR?: string;
    note_EN?: string;
    note_DE?: string;
    note_AR?: string;
    // Legacy fields for backward compatibility (computed from name_TR)
    name?: string;
    nameEn?: string;
    note?: string;
    // Other fields
    isRequired: boolean;
    isActive?: boolean;
    allowedFileTypes?: string;
    maxFileSizeBytes?: number;
    maxFileSizeFormatted?: string;
    requiresApproval: boolean;
    educationTypeId?: number;
    educationTypeName?: string;
    displayOrder?: number;
    iconName?: string;
}

export interface IClientDocumentListDto {
    clientId: number;
    clientName: string;
    totalDocuments: number;
    pendingDocuments: number;
    acceptedDocuments: number;
    rejectedDocuments: number;
    requiredDocumentCount: number;
    documents: IDocumentResponseDto[];
}

// Document Review Types (Admin)
export interface IDocumentReviewDto {
    documentId: number;
    decision: 'Accepted' | 'Rejected' | 'MissingInfo';
    reviewNote?: string;
    feedbackMessage?: string;
}

export interface IDocumentReviewStatistics {
    totalDocuments: number;
    pendingForReview: number;
    accepted: number;
    rejected: number;
    missingInfo: number;
}

