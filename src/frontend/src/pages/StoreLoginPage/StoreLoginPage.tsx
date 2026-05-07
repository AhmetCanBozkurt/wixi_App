import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaStore, FaLock } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useStoreAuthStore } from '../../entities/StoreAdmin/model/store';
import styles from './StoreLoginPage.module.css';

const loginSchema = z.object({
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  tenantSlug: string;
  tenantName: string;
  email: string;
}

const storeApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const StoreLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useStoreAuthStore((state) => state.login);

  const prefillEmail = searchParams.get('tenant') ?? '';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await storeApiClient.post<LoginResponse>('/store-admin/auth/login', data);
      const { token, tenantSlug, tenantName, email } = response.data;

      login(token, tenantSlug, tenantName, email);

      toast.success('Mağaza panelinize hoş geldiniz!', {
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          border: '1px solid var(--color-success)',
        },
      });

      setTimeout(() => {
        navigate('/store');
      }, 600);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        toast.error('E-posta veya şifre hatalı.', {
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-main)',
            border: '1px solid var(--color-danger)',
          },
        });
      } else {
        toast.error('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.body}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <FaStore />
            </div>
            <h2 className={styles.brandName}>Wixi Store</h2>
          </div>

          <div className={styles.subtitleBox}>
            <h3 className={styles.subtitle}>Mağaza Yönetici Girişi</h3>
            <p className={styles.desc}>
              {prefillEmail
                ? `"${prefillEmail}" mağazası için giriş yapın`
                : 'Mağaza panelinize erişmek için giriş yapın'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>E-posta</label>
              <input
                type="email"
                className={styles.input}
                placeholder="E-posta adresinizi girin"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Şifre</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <div className={styles.footer}>
          <FaLock style={{ fontSize: '0.8rem', opacity: 0.7 }} />
          <span>Güvenli bağlantı — Wixi SaaS Panel</span>
        </div>
      </div>
    </div>
  );
};
