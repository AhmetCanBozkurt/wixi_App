// Support System Types

export interface ISupportTicketCreateDto {
    clientId: number;
    subject: string;
    description: string;
    priority?: string; // Low, Medium, High, Urgent
    category?: string; // General, Technical, Billing, Other
}

export interface ISupportTicketUpdateDto {
    subject: string;
    description: string;
    priority: string;
    status: string;
}

export interface ISupportTicketResponseDto {
    id: number;
    clientId: number;
    clientName: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: string; // Open, InProgress, Resolved, Closed
    priority: string;
    category: string;
    assignedToUserId?: number;
    assignedToUserName?: string;
    createdAt: string;
    resolvedAt?: string;
    lastMessageAt?: string;
    messageCount: number;
    messages: ISupportMessageDto[];
}

export interface ISupportMessageCreateDto {
    ticketId: number;
    senderId: number;
    messageText: string;
}

export interface ISupportMessageDto {
    id: number;
    ticketId: number;
    senderId: number;
    senderName: string;
    senderRole: string; // Client, Admin, Support
    messageText: string;
    sentAt: string;
    isRead: boolean;
}

export interface ITicketAssignDto {
    assignedToUserId: number;
}

export interface ITicketStatusUpdateDto {
    status: string; // Open, InProgress, Resolved, Closed
}

// FAQ Types - Multi-language support (TR, EN, DE, AR)
export interface IFAQDto {
    id: number;
    // Multi-language questions (4 languages: TR, EN, DE, AR)
    question_TR: string;
    question_EN: string;
    question_DE: string;
    question_AR: string;
    // Multi-language answers (4 languages: TR, EN, DE, AR)
    answer_TR: string;
    answer_EN: string;
    answer_DE: string;
    answer_AR: string;
    // Legacy fields for backward compatibility (computed from TR)
    question?: string;
    answer?: string;
    questionEn?: string;
    answerEn?: string;
    // Other fields
    category: string;
    tags?: string;
    displayOrder: number;
    isActive: boolean;
    isFeatured?: boolean;
    viewCount?: number;
    helpfulCount?: number;
    notHelpfulCount?: number;
    helpfulRatio?: number;
    relatedLink?: string;
    videoUrl?: string;
    createdAt?: string;
}

export interface IFAQCreateDto {
    // Multi-language questions (4 languages: TR, EN, DE, AR)
    question_TR: string;
    question_EN: string;
    question_DE: string;
    question_AR: string;
    // Multi-language answers (4 languages: TR, EN, DE, AR)
    answer_TR: string;
    answer_EN: string;
    answer_DE: string;
    answer_AR: string;
    // Other fields
    category: string;
    tags?: string;
    displayOrder: number;
    isFeatured?: boolean;
}

export interface IFAQUpdateDto {
    // Multi-language questions (optional for updates)
    question_TR?: string;
    question_EN?: string;
    question_DE?: string;
    question_AR?: string;
    // Multi-language answers (optional for updates)
    answer_TR?: string;
    answer_EN?: string;
    answer_DE?: string;
    answer_AR?: string;
    // Other fields
    category?: string;
    tags?: string;
    displayOrder?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    relatedLink?: string;
    videoUrl?: string;
}

