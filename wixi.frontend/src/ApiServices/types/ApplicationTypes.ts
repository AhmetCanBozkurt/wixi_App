// Application Tracking Types

export interface IApplicationCreateDto {
    clientId: number;
    templateId: number;
    notes?: string;
}

export interface IApplicationUpdateDto {
    notes?: string;
}

export interface IApplicationResponseDto {
    id: number;
    clientId: number;
    clientName: string;
    templateId: number;
    templateName: string;
    status: string;
    currentStepOrder: number;
    currentStepName?: string;
    totalSteps: number;
    completedSteps: number;
    progressPercentage: number;
    startDate: string;
    completionDate?: string;
    estimatedCompletionDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    steps: IApplicationStepResponseDto[];
}

export interface IApplicationStepResponseDto {
    id: number;
    applicationId: number;
    name: string;
    title?: string; // Backend returns 'title' from ApplicationStep.Title
    description?: string;
    stepOrder: number;
    status: string;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    assignedToUserId?: number;
    assignedToUserName?: string;
    subSteps: IApplicationSubStepResponseDto[];
}

export interface IApplicationSubStepResponseDto {
    id: number;
    stepId: number;
    name: string;
    description?: string;
    subStepOrder: number;
    isCompleted: boolean;
    status?: string; // NotStarted, InProgress, Completed, etc.
    completedAt?: string;
    notes?: string;
}

export interface IStepUpdateDto {
    status: string; // NotStarted, InProgress, Completed, Blocked
    notes?: string;
    assignedToUserId?: number;
}

export interface ISubStepUpdateDto {
    status: string; // NotStarted, InProgress, Completed
    notes?: string;
}

export interface IApplicationHistoryDto {
    id: number;
    applicationId: number;
    action: string;
    description?: string;
    oldValue?: string;
    newValue?: string;
    changedByUserId: number;
    changedByUserName: string;
    changedAt: string;
}

export interface IApplicationTemplateDto {
    id: number;
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
    description?: string;
    // Other fields
    type: string;
    isActive: boolean;
    isDefault: boolean;
    displayOrder: number;
    iconName?: string;
    estimatedDurationDays?: number;
    minDurationDays?: number;
    maxDurationDays?: number;
    // Step templates
    stepTemplates: IApplicationStepTemplateDto[];
    // Legacy field for backward compatibility
    steps?: IApplicationStepTemplateDto[];
}

export interface IApplicationStepTemplateDto {
    id: number;
    applicationTemplateId: number;
    // Multi-language titles (4 languages: TR, EN, DE, AR)
    title_TR: string;
    title_EN: string;
    title_DE: string;
    title_AR: string;
    // Multi-language descriptions
    description_TR?: string;
    description_EN?: string;
    description_DE?: string;
    description_AR?: string;
    // Legacy fields for backward compatibility
    name?: string;
    nameEn?: string;
    description?: string;
    // Other fields
    stepOrder: number;
    iconName?: string;
    isRequired: boolean;
    isActive: boolean;
    estimatedDurationDays?: number;
    // Sub-step templates
    subStepTemplates: IApplicationSubStepTemplateDto[];
    // Legacy field for backward compatibility
    subSteps?: IApplicationSubStepTemplateDto[];
}

export interface IApplicationSubStepTemplateDto {
    id: number;
    stepTemplateId: number;
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
    // Legacy fields for backward compatibility
    name?: string;
    nameEn?: string;
    description?: string;
    // Other fields
    subStepOrder: number;
    isRequired: boolean;
    isActive: boolean;
    estimatedDurationDays?: number;
}

