// V2 Backend Configuration
// Production: https://api-tekstil.wixisoftware.com
// Development: http://localhost:6012

import { Logger } from '../../utils/logger';

// BASE_URL - Environment variable ile override edilebilir, yoksa production kullan
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7080';
const API_URL = `${BASE_URL}/api/v1.0`;
const API_VERSION = 'v1.0';

// Debug: Log the BASE_URL (only in development via Logger)
if (typeof window !== 'undefined') {
    Logger.info('🔧 API BASE_URL:', BASE_URL);
}

export { BASE_URL, API_URL, API_VERSION };

export const API_ROUTES = {
    BASE_URL,
    AUTH: {
        LOGIN: `${BASE_URL}/api/${API_VERSION}/auth/login`,
        REGISTER: `${BASE_URL}/api/${API_VERSION}/auth/register`,
        LOGOUT: `${BASE_URL}/api/${API_VERSION}/auth/logout`,
        REFRESH_TOKEN: `${BASE_URL}/api/${API_VERSION}/auth/refresh`,
        REVOKE: `${BASE_URL}/api/${API_VERSION}/auth/revoke`,
        GET_CURRENT_USER: `${BASE_URL}/api/${API_VERSION}/auth/me`,
        LOGOUT_ALL: `${BASE_URL}/api/${API_VERSION}/auth/logout-all`
    },
    FORMS: {
        CONTACT: `${BASE_URL}/api/${API_VERSION}/forms/contact`,
        EMPLOYER: `${BASE_URL}/api/${API_VERSION}/forms/employer`,
        EMPLOYEE: `${BASE_URL}/api/${API_VERSION}/forms/employee`,
        LIST: {
            EMPLOYEE: `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employees`,
            EMPLOYER: `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employers`,
            CONTACT: `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/contacts`,
        },
        DETAIL: {
            EMPLOYER: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employers/${id}`,
            EMPLOYEE: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employees/${id}`,
        },
        CV_DOWNLOAD: {
            EMPLOYEE: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employees/${id}/cv`,
        },
        CREATE_CLIENT_FROM_EMPLOYEE: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/employees/${id}/create-client`,
        PENDING_CLIENT_CODES: `${BASE_URL}/api/${API_VERSION}/admin/form-submissions/pending-client-codes`,
    },
    EMAIL_TEMPLATES: {
        BASE: `${BASE_URL}/api/${API_VERSION}/admin/email-templates`,
        BY_KEY: (key: string) => `${BASE_URL}/api/${API_VERSION}/admin/email-templates/${key}`,
        PREVIEW: (key: string) => `${BASE_URL}/api/${API_VERSION}/admin/email-templates/${key}/preview`
    },
    ADMIN: {
        USERS: `${BASE_URL}/api/${API_VERSION}/admin/users`,
        USERS_STATS: `${BASE_URL}/api/${API_VERSION}/admin/users/stats`,
        DASHBOARD_STATS: `${BASE_URL}/api/${API_VERSION}/admin/dashboard/stats`,
        LOGS_STATS: `${BASE_URL}/api/${API_VERSION}/admin/logs/audit/stats`,
        AUDIT_LOGS: `${BASE_URL}/api/${API_VERSION}/admin/logs/audit`,
        ROLES: `${BASE_URL}/api/${API_VERSION}/admin/roles`,
        ROLES_ASSIGN: `${BASE_URL}/api/${API_VERSION}/admin/roles/assign`,
        ROLES_REMOVE: `${BASE_URL}/api/${API_VERSION}/admin/roles/remove`,
        DATABASE_STATS: `${BASE_URL}/api/${API_VERSION}/admin/database/stats`,
        EMAIL_LOGS: `${BASE_URL}/api/${API_VERSION}/admin/email/logs`,
        EMAIL_SETTINGS: `${BASE_URL}/api/${API_VERSION}/admin/email/smtp-settings`,
        EMAIL_TEST: `${BASE_URL}/api/${API_VERSION}/admin/email/test-send`
    },
    TEAM_MEMBERS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/team-members`,
        BY_SLUG: (slug: string) => `${BASE_URL}/api/${API_VERSION}/team-members/${slug}`,
        ADMIN: {
            BASE: `${BASE_URL}/api/${API_VERSION}/admin/team-members`,
            BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/team-members/${id}`,
            UPLOAD_IMAGE: `${BASE_URL}/api/${API_VERSION}/admin/team-members/upload-image`,
            DELETE_IMAGE: `${BASE_URL}/api/${API_VERSION}/admin/team-members/delete-image`
        }
    },
    NEWS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/news`,
        BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/news/${id}`,
        BY_SLUG: (slug: string) => `${BASE_URL}/api/${API_VERSION}/news/slug/${slug}`,
        ADMIN: {
            BASE: `${BASE_URL}/api/${API_VERSION}/admin/news`,
            BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/news/${id}`,
            UPLOAD_IMAGE: `${BASE_URL}/api/${API_VERSION}/admin/news/upload-image`,
            DELETE_IMAGE: `${BASE_URL}/api/${API_VERSION}/admin/news/delete-image`
        }
    },
    // Document Tracking System APIs
    DOCUMENTS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/documents`,
        UPLOAD: `${BASE_URL}/api/${API_VERSION}/documents/upload`,
        BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/documents/${id}`,
        CLIENT: (clientId: number) => `${BASE_URL}/api/${API_VERSION}/documents/client/${clientId}`,
        DOWNLOAD: (id: number) => `${BASE_URL}/api/${API_VERSION}/documents/download/${id}`,
        TYPES: `${BASE_URL}/api/${API_VERSION}/documents/types`,
        TYPES_BY_EDUCATION: (educationTypeId: number) => `${BASE_URL}/api/${API_VERSION}/documents/types/education/${educationTypeId}`,
        ADMIN: {
            TYPES: `${BASE_URL}/api/${API_VERSION}/admin/document-types`,
            BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/admin/document-types/${id}`
        }
    },
    DOCUMENT_REVIEW: {
        BASE: `${BASE_URL}/api/${API_VERSION}/admin/document-review`,
        PENDING: `${BASE_URL}/api/${API_VERSION}/admin/document-review/pending`,
        BY_STATUS: (status: string) => `${BASE_URL}/api/${API_VERSION}/admin/document-review/status/${status}`,
        REVIEW: (documentId: number) => `${BASE_URL}/api/${API_VERSION}/admin/document-review/${documentId}/review`,
        HISTORY: (documentId: number) => `${BASE_URL}/api/${API_VERSION}/admin/document-review/${documentId}/history`,
        STATISTICS: `${BASE_URL}/api/${API_VERSION}/admin/document-review/stats`
    },
    APPLICATIONS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/applications`,
        BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/applications/${id}`,
        CLIENT: (clientId: number) => `${BASE_URL}/api/${API_VERSION}/applications/client/${clientId}`,
        UPDATE_STEP: (stepId: number) => `${BASE_URL}/api/${API_VERSION}/applications/steps/${stepId}`,
        UPDATE_SUBSTEP: (subStepId: number) => `${BASE_URL}/api/${API_VERSION}/applications/sub-steps/${subStepId}`,
        HISTORY: (applicationId: number) => `${BASE_URL}/api/${API_VERSION}/applications/${applicationId}/history`,
        TEMPLATES: `${BASE_URL}/api/${API_VERSION}/applications/templates`,
        TEMPLATE_BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/applications/templates/${id}`
    },
    CLIENTS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/clients`,
        BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/clients/${id}`,
        BY_USER: (userId: number) => `${BASE_URL}/api/${API_VERSION}/clients/user/${userId}`,
        EDUCATION: `${BASE_URL}/api/${API_VERSION}/clients/education`,
        EDUCATION_BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/clients/education/${id}`,
        EDUCATION_TYPES: `${BASE_URL}/api/${API_VERSION}/clients/education-types`
    },
    SUPPORT: {
        TICKETS: {
            BASE: `${BASE_URL}/api/${API_VERSION}/support/tickets`,
            BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/support/tickets/${id}`,
            CLIENT: (clientId: number) => `${BASE_URL}/api/${API_VERSION}/support/tickets/client/${clientId}`,
            ASSIGN: (ticketId: number) => `${BASE_URL}/api/${API_VERSION}/support/tickets/${ticketId}/assign`,
            STATUS: (ticketId: number) => `${BASE_URL}/api/${API_VERSION}/support/tickets/${ticketId}/status`
        },
        MESSAGES: {
            BASE: `${BASE_URL}/api/${API_VERSION}/support/messages`,
            BY_TICKET: (ticketId: number) => `${BASE_URL}/api/${API_VERSION}/support/tickets/${ticketId}/messages`
        },
        FAQ: {
            BASE: `${BASE_URL}/api/${API_VERSION}/support/faqs`,
            BY_CATEGORY: (category: string) => `${BASE_URL}/api/${API_VERSION}/support/faqs/category/${category}`,
            BY_ID: (id: number) => `${BASE_URL}/api/${API_VERSION}/support/faqs/${id}`
        }
    },
    DATABASE: {
        STATS: `${BASE_URL}/api/${API_VERSION}/admin/database/stats`,
        CLEANUP_TEST_DATA: (includeUsers: boolean = false) => `${BASE_URL}/api/${API_VERSION}/admin/database/cleanup-test-data?includeUsers=${includeUsers}`,
        CLEANUP_CLIENT_DATA: (clientId: number, deleteUser: boolean = false) => `${BASE_URL}/api/${API_VERSION}/admin/database/cleanup-client-data/${clientId}?deleteUser=${deleteUser}`
    },
    CONTENT_SETTINGS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/content-settings`,
        ADMIN: `${BASE_URL}/api/${API_VERSION}/admin/content-settings`
    },
    SYSTEM_SETTINGS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/admin/settings`
    },
    TRANSLATIONS: {
        BASE: `${BASE_URL}/api/${API_VERSION}/i18n`,
        LIST: `${BASE_URL}/api/${API_VERSION}/i18n/list`,
        BY_KEY: (key: string) => `${BASE_URL}/api/${API_VERSION}/i18n/key/${key}`,
        ADMIN: `${BASE_URL}/api/${API_VERSION}/admin/translations`,
        ADMIN_BY_KEY: (key: string) => `${BASE_URL}/api/${API_VERSION}/admin/translations/${key}`
    },
    USER_PREFERENCES: {
        BASE: `${BASE_URL}/api/${API_VERSION}/user-preferences`,
        ADMIN: `${BASE_URL}/api/${API_VERSION}/admin/user-preferences`,
        BY_USER: (userId: string) => `${BASE_URL}/api/${API_VERSION}/admin/user-preferences/${userId}`
    },
    TEKSTIL: {
        LANGUAGES: `${BASE_URL}/api/${API_VERSION}/tekstil/languages`,
        ABOUT: `${BASE_URL}/api/${API_VERSION}/tekstil/about`,
        STATS: `${BASE_URL}/api/${API_VERSION}/tekstil/stats`,
        PRODUCT_CATEGORIES: `${BASE_URL}/api/${API_VERSION}/tekstil/product-categories`,
        PRODUCTS: `${BASE_URL}/api/${API_VERSION}/tekstil/products`,
        PROJECT_CATEGORIES: `${BASE_URL}/api/${API_VERSION}/tekstil/project-categories`,
        PROJECTS: `${BASE_URL}/api/${API_VERSION}/tekstil/projects`,
        CONTACT_INFO: `${BASE_URL}/api/${API_VERSION}/tekstil/contact-info`,
        CONTACT_SUBMISSIONS: `${BASE_URL}/api/${API_VERSION}/tekstil/contact-submissions`,
    }
};

