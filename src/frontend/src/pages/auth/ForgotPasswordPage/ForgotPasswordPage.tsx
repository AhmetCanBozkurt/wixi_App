import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import styles from './ForgotPasswordPage.module.css';
import logoSrc from '../../../assets/Logolar/logo.png';

const schema = z.object({
  email: z.string().min(1, 'Email zorunludur').email('Lütfen geçerli bir e-posta adresi girin'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ message?: string }>('/Auth/forgot-password', data);
      setSent(true);
      toast.success(
        res.data?.message ??
          'Eğer bu e-posta ile bir hesap varsa, sıfırlama bağlantısı gönderildi.'
      );
    } catch {
      toast.error('İşlem sırasında hata oluştu.');
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

        {sent ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h2 className={styles.title}>E-posta gönderildi</h2>
            <p className={styles.desc}>
              Mail kutunuzu kontrol edin. Bağlantı gelmediyse spam/junk klasörünü de kontrol edin.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.iconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2 className={styles.title}>Şifremi Unuttum</h2>
            <p className={styles.desc}>E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className={styles.label}>E-posta adresi</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="ornek@sirket.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <div className={styles.error}>{errors.email.message}</div>}
              </div>
              <button className={styles.primary} disabled={isLoading}>
                {isLoading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
            </form>
          </>
        )}

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
