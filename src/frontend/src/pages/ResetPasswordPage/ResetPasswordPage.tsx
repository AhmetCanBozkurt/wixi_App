import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../shared/api/axiosConfig';
import styles from './ResetPasswordPage.module.css';

const schema = z.object({
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Şifre sıfırlama başarısız.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Şifre Sıfırla</h2>
        <p className={styles.desc}>Yeni şifrenizi belirleyin.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <label className={styles.label}>Yeni şifre</label>
          <input className={styles.input} type="password" autoComplete="new-password" {...register('newPassword')} />
          {errors.newPassword && <div className={styles.error}>{errors.newPassword.message}</div>}

          <button className={styles.primary} disabled={isLoading || !email || !token}>
            {isLoading ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>Giriş sayfasına dön</Link>
        </div>
      </div>
    </div>
  );
};

