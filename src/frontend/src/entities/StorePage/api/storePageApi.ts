import { apiClient } from '../../../shared/api/axiosConfig';
import type { StorePage, StorePageSummary, StoreSettings, StorePageType, ThemeVersionSummary, ThemeVersionDetail } from '../model/types';

const storeAdminBase = '/store-admin';
const publicBase = '/public/storefront';

// ── Admin API ─────────────────────────────────────────────────────────────────

export const storeAdminApi = {
  getSettings: (tenantSlug: string) =>
    apiClient.get<StoreSettings>(`${storeAdminBase}/settings`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  updateSettings: (tenantSlug: string, data: Partial<StoreSettings>) =>
    apiClient.put(`${storeAdminBase}/settings`, data, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getPages: (tenantSlug: string) =>
    apiClient.get<StorePageSummary[]>(`${storeAdminBase}/pages`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getPage: (tenantSlug: string, slug: string) =>
    apiClient.get<StorePage>(`${storeAdminBase}/pages/${slug}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  createPage: (tenantSlug: string, data: { title: string; slug: string; pageType: StorePageType }) =>
    apiClient.post<StorePage>(`${storeAdminBase}/pages`, data, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  updateLayout: (tenantSlug: string, pageId: string, layoutConfigJson: string | null, themeOverrideJson?: string | null) =>
    apiClient.put(`${storeAdminBase}/pages/${pageId}/layout`, { layoutConfigJson, themeOverrideJson }, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  updateSeo: (tenantSlug: string, pageId: string, seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    openGraphImageUrl: string | null;
  }) =>
    apiClient.put(`${storeAdminBase}/pages/${pageId}/seo`, seo, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  updateBacklinks: (tenantSlug: string, pageId: string, backlinksJson: string | null) =>
    apiClient.put(`${storeAdminBase}/pages/${pageId}/backlinks`, { backlinksJson }, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  publishPage: (tenantSlug: string, pageId: string, isPublished: boolean) =>
    apiClient.put(`${storeAdminBase}/pages/${pageId}/publish`, { isPublished }, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  deletePage: (tenantSlug: string, pageId: string) =>
    apiClient.delete(`${storeAdminBase}/pages/${pageId}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getThemeVersions: (tenantSlug: string) =>
    apiClient.get<ThemeVersionSummary[]>(`${storeAdminBase}/theme-versions`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getThemeVersion: (tenantSlug: string, id: number) =>
    apiClient.get<ThemeVersionDetail>(`${storeAdminBase}/theme-versions/${id}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  createCheckpoint: (tenantSlug: string, label: string) =>
    apiClient.post<{ id: number }>(`${storeAdminBase}/theme-versions/checkpoint`, { label }, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  rollbackVersion: (tenantSlug: string, id: number) =>
    apiClient.post(`${storeAdminBase}/theme-versions/${id}/rollback`, {}, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),
};

// ── Public API ────────────────────────────────────────────────────────────────

export const storefrontApi = {
  getSettings: (tenantSlug: string) =>
    apiClient.get<StoreSettings>(`${publicBase}/settings`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getTheme: (tenantSlug: string) =>
    apiClient.get<{ themeConfigJson: string | null }>(`${publicBase}/theme`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getPages: (tenantSlug: string) =>
    apiClient.get<StorePageSummary[]>(`${publicBase}/pages`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getPage: (tenantSlug: string, slug: string) =>
    apiClient.get<StorePage>(`${publicBase}/page/${slug}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getProducts: (tenantSlug: string, params?: Record<string, unknown>) =>
    apiClient.get(`${publicBase}/products`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
      params,
    }),

  getProductBySlug: (tenantSlug: string, slug: string) =>
    apiClient.get(`${publicBase}/products/${slug}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getCategories: (tenantSlug: string, params?: Record<string, unknown>) =>
    apiClient.get(`${publicBase}/categories`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
      params,
    }),

  getBrands: (tenantSlug: string) =>
    apiClient.get(`${publicBase}/brands`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  subscribeNewsletter: (tenantSlug: string, email: string) =>
    apiClient.post(`${publicBase}/newsletter`, { email }, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  submitContact: (tenantSlug: string, data: { name: string; email: string; subject: string; message: string }) =>
    apiClient.post(`${publicBase}/contact`, data, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  // ── Content endpoints (api/v1/storefront/content/*) ──────────────────────
  getTestimonials: (tenantSlug: string) =>
    apiClient.get(`/storefront/content/testimonials`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getPromoBanners: (tenantSlug: string) =>
    apiClient.get(`/storefront/content/promo-banners`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getSlider: (tenantSlug: string, sliderId: string) =>
    apiClient.get(`/storefront/content/sliders/${sliderId}`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),

  getFaq: (tenantSlug: string, category?: string) =>
    apiClient.get(`/storefront/content/faq`, {
      headers: { 'X-Tenant-Slug': tenantSlug },
      params: category ? { category } : undefined,
    }),

  submitContactNew: (tenantSlug: string, data: { fullName: string; email: string; phone?: string; subject?: string; message: string }) =>
    apiClient.post(`/storefront/content/contact`, data, {
      headers: { 'X-Tenant-Slug': tenantSlug },
    }),
};
