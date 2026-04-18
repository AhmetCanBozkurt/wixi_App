import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useAuthStore } from '../../../entities/User/model/store';
import styles from './LoginForm.module.css';
import logoSrc from '../../../assets/Logolar/logo.png';
import { TwoFactorModal } from './TwoFactorModal.tsx';

const loginSchema = z.object({
  email: z.string().min(1, 'Email zorunludur').email('Lütfen geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/Auth/login', { ...data, rememberMe });
      
      if (response.data?.requiresTwoFactor) {
        setTwoFactorToken(response.data.twoFactorToken);
        toast.success("Doğrulama kodu e-posta adresinize gönderildi.", {
          style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-success)' }
        });
        return;
      }

      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        await login(token);
        toast.success("Oturumunuz güvenli bir şekilde açıldı!", {
            style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-success)' }
        });
        
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.containerWrapper}>
      <TwoFactorModal
        isOpen={!!twoFactorToken}
        twoFactorToken={twoFactorToken}
        rememberMe={rememberMe}
        onClose={() => setTwoFactorToken(null)}
        onSuccess={async (token) => {
          await login(token);
          toast.success("Oturumunuz güvenli bir şekilde açıldı!", {
            style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-success)' }
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 800);
        }}
      />
      <div className={styles.body}>
        <div className={styles.header}>
          <img src={logoSrc} alt="Wixisoftware Logo" className={styles.logoIcon} />
          <h2 className={styles.title}>Wixisoftware</h2>
        </div>

        <div className={styles.subtitleBox}>
          <h3 className={styles.subtitle}>Login</h3>
          <p className={styles.desc}>Please enter your details to login.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="Enter your username or email"
              autoComplete="email"
              {...register('email')}
            />
          </div>
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                className={styles.input} 
                placeholder="Enter your password"
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

          <div className={styles.optionsRow}>
            <label className={styles.rememberMe}>
              <input 
                type="checkbox" 
                className={styles.checkbox} 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <a
              href="/forgot-password"
              className={styles.forgotLink}
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Bağlanıyor..." : "Login"}
          </button>

        </form>
      </div>

      <div className={styles.footer}>
        <FaLock style={{ fontSize: '0.8rem', opacity: 0.7 }} />
        <span>© 2026 Wixisoftware. All rights reserved.</span>
      </div>
    </div>
  );
};
