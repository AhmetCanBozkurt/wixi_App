import axios, { type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token ve Dil eklemesi
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Tarayıcıdaki veya seçilen dili header olarak ekle
  const lang = localStorage.getItem('lng') || 'tr-TR';
  config.headers['Accept-Language'] = lang;
  
  // E-Ticaret için aktif mağaza seçimi
  const tenantSlug = localStorage.getItem('wixi-active-tenant');
  if (tenantSlug) {
    config.headers['X-Tenant-Slug'] = tenantSlug;
  }

  return config;
});

// Response Interceptor: Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Don't try to refresh if the request itself was a refresh request
      if (originalRequest?.url?.includes('/Auth/refresh')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Try a single refresh before forcing logout
      if (!originalRequest?._retry) {
        originalRequest._retry = true;
        try {
          const refreshRes = await apiClient.post('/Auth/refresh', null);
          const newToken = refreshRes.data?.token || refreshRes.data?.accessToken;
          if (newToken) {
            localStorage.setItem('token', newToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // fallthrough to logout
        }
      }

      localStorage.removeItem('token');
      toast.error('Oturumunuz süresi doldu, lütfen tekrar giriş yapın.');
      window.location.href = '/login';
    }
    else if (error.response?.status === 429) {
      const msg =
        (error.response?.data as { error?: string })?.error ??
        'Çok fazla istek. Lütfen kısa bir süre sonra tekrar deneyin.';
      toast.error(msg);
    }
    else if (error.response?.status >= 500) {
      toast.error('Sunucu sunucu bağlantı hatası.');
    }
    return Promise.reject(error);
  }
);

export const uploadStoreImage = async (file: File): Promise<string> => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await apiClient.post<{ url: string }>('/store-admin/upload', fd, {
    headers: { 'Content-Type': null as unknown as string },
  });
  return res.data.url;
};

export default apiClient;
