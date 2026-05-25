import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import styles from './ResetPasswordPage.module.css';
import logoSrc from '../../../assets/Logolar/logo.png';

const schema = z.object({
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!email || !token) {
      toast.error('Reset linki eksik veya hatalı.');
    }
  }, [email, token]);

  const onSubmit = async (data: FormData) => {
    if (!email || !token) return;
    setIsLoading(true);
    try {
      await apiClient.post('/Auth/reset-password', {
        email,
        token,
        newPassword: data.newPassword,
      });
      toast.success('Şifreniz güncellendi. Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Şifre sıfırlama başarısız.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <img src={logoSrc} alt="Wixi" className={styles.brandLogo} />
          <span className={styles.brandName}>Wixi</span>
        </div>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 className={styles.title}>Şifre Sıfırla</h2>
        <p className={styles.desc}>Hesabınız için yeni bir şifre belirleyin.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className={styles.label}>Yeni şifre</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && <div className={styles.error}>{errors.newPassword.message}</div>}
          </div>

          <button className={styles.primary} disabled={isLoading || !email || !token}>
            {isLoading ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};
