import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useAuthStore } from '../../../entities/User/model/store';
import styles from './LoginForm.module.css';

const loginSchema = z.object({
  email: z.string().min(1, 'Email zorunludur').email('Lütfen geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/Auth/login', data);
      
      if (response.data?.token) {
        login(response.data.token);
        // User rule strict instruction applied here: All successes and errors must be a toaster!
        toast.success("Oturumunuz güvenli bir şekilde açıldı!", {
            style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-success)' }
        });
        
        // Timeout to allow the toast to show and state to propagate before navigation
        setTimeout(() => {
            window.location.href = '/'; 
        }, 800);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Girdiğiniz e-posta veya şifre hatalı.", {
            style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-danger)' }
        });
      }
      // Diğer sunucu hataları axiosConfig içerisindeki Interceptor tarafından toastlanacaktır.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} textGradient`}>Platforma Giriş</h1>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Kurumsal E-posta</label>
          <input 
            type="email" 
            className={styles.input} 
            placeholder="admin@wixi.com"
            autoComplete="email"
            {...register('email')}
          />
        </div>
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Parola</label>
          <input 
            type="password" 
            className={styles.input} 
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
        </div>
        {errors.password && <span className={styles.error}>{errors.password.message}</span>}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "Bağlanıyor..." : "Sisteme Gir"}
        </button>

      </form>
    </div>
  );
};
