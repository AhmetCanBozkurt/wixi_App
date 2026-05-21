import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import styles from './ForgotPasswordPage.module.css';

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
        <h2 className={styles.title}>Şifremi Unuttum</h2>
        {sent ? (
          <p className={styles.desc}>
            Mail kutunuzu kontrol edin. Bağlantı gelmediyse spam/junk klasörünü de kontrol edin.
          </p>
        ) : (
          <>
            <p className={styles.desc}>E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <label className={styles.label}>E-posta</label>
              <input className={styles.input} type="email" autoComplete="email" {...register('email')} />
              {errors.email && <div className={styles.error}>{errors.email.message}</div>}
              <button className={styles.primary} disabled={isLoading}>
                {isLoading ? 'Gönderiliyor…' : 'Gönder'}
              </button>
            </form>
          </>
        )}

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>Giriş sayfasına dön</Link>
        </div>
      </div>
    </div>
  );
};

