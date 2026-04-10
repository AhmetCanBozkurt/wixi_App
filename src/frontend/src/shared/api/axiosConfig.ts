import axios from 'axios';
import toast from 'react-hot-toast';

export const apiClient = axios.create({
  baseURL: 'https://localhost:7081/api/v1', // Backend API adresi
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token eklemesi
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      toast.error('Oturumunuz süresi doldu, lütfen tekrar giriş yapın.');
      window.location.href = '/login';
    } 
    else if (error.response?.status >= 500) {
      toast.error('Sunucu sunucu bağlantı hatası.');
    }
    return Promise.reject(error);
  }
);
