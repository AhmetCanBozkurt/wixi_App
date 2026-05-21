import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock, FaStore } from 'react-icons/fa';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useAuthStore } from '../../../entities/User/model/store';
import styles from './StoreAdminLoginPage.module.css';

const schema = z.object({
  email: z.string().min(1, 'Email zorunludur').email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type FormData = z.infer<typeof schema>;

export const StoreAdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ token: string; tenantSlug: string }>('/store-admin/auth/login', data);
      const { token, tenantSlug } = res.data;
      await login(token);
      toast.success('Mağaza panelinize hoş geldiniz!');
      setTimeout(() => {
        window.location.href = `/tenant/${tenantSlug}`;
      }, 600);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { error?: string } } })?.response;
      const msg = status?.data?.error ?? 'E-posta veya şifre hatalı.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}><FaStore /></div>
          <h2 className={styles.title}>Mağaza Paneli</h2>
          <p className={styles.sub}>Mağazanızı yönetmek için giriş yapın.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.field}>
            <label className={styles.label}>E-posta</label>
            <input
              type="email"
              className={styles.input}
              placeholder="ornek@magaza.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Şifre</label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Şifrenizi girin"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className={styles.footer}>
          <FaLock style={{ fontSize: '0.75rem', opacity: 0.6 }} />
          <span>© 2026 Wixisoftware. Güvenli bağlantı.</span>
        </p>
      </div>
    </div>
  );
};
