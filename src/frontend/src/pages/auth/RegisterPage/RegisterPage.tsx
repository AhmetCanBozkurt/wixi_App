import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import styles from './RegisterPage.module.css';
import logoSrc from '../../../assets/Logolar/logo.png';

const schema = z.object({
  firstName: z.string().min(1, 'Ad zorunludur').max(100),
  lastName: z.string().min(1, 'Soyad zorunludur').max(100),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta girin'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir'),
  passwordConfirm: z.string().min(1, 'Şifre tekrarı zorunludur'),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['passwordConfirm'],
});

type FormData = z.infer<typeof schema>;

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: 'transparent' },
    { label: 'Zayıf', color: '#f87171' },
    { label: 'Orta', color: '#fbbf24' },
    { label: 'İyi', color: '#34d399' },
    { label: 'Güçlü', color: '#7ce4a4' },
  ];
  return { score, ...map[score] };
}

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pwVal = watch('password', '');
  const strength = getStrength(pwVal);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/Auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { errorMessage?: string; error?: string; errors?: Record<string, string[]> } } };
      const msg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.error ||
        Object.values(err?.response?.data?.errors ?? {}).flat()[0] ||
        'Kayıt sırasında bir hata oluştu.';
      toast.error(msg);
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>

        <h2 className={styles.title}>Hesap Oluştur</h2>
        <p className={styles.desc}>14 gün ücretsiz deneyin. Kredi kartı gerekmez.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {/* Ad / Soyad */}
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Ad</label>
              <input
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                type="text"
                placeholder="Adınız"
                autoComplete="given-name"
                {...register('firstName')}
              />
              {errors.firstName && <div className={styles.error}>{errors.firstName.message}</div>}
            </div>
            <div>
              <label className={styles.label}>Soyad</label>
              <input
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                type="text"
                placeholder="Soyadınız"
                autoComplete="family-name"
                {...register('lastName')}
              />
              {errors.lastName && <div className={styles.error}>{errors.lastName.message}</div>}
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className={styles.label}>E-posta</label>
            <input
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              type="email"
              placeholder="ornek@sirket.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <div className={styles.error}>{errors.email.message}</div>}
          </div>

          {/* Şifre */}
          <div>
            <label className={styles.label}>Şifre</label>
            <div className={styles.inputWrap}>
              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="En az 8 karakter"
                autoComplete="new-password"
                {...register('password')}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                {showPw ? (
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
            {/* Strength bar */}
            {pwVal.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={styles.strengthSegment}
                      style={{ background: strength.score >= i ? strength.color : undefined }}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && <div className={styles.error}>{errors.password.message}</div>}
          </div>

          {/* Şifre Tekrar */}
          <div>
            <label className={styles.label}>Şifre Tekrar</label>
            <div className={styles.inputWrap}>
              <input
                className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
                type={showPwC ? 'text' : 'password'}
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
                {...register('passwordConfirm')}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwC((v) => !v)} tabIndex={-1}>
                {showPwC ? (
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
            {errors.passwordConfirm && <div className={styles.error}>{errors.passwordConfirm.message}</div>}
          </div>

          {/* Terms note */}
          <p className={styles.terms}>
            Kayıt olarak{' '}
            <Link to="/kullanim-sartlari" className={styles.termsLink}>Kullanım Şartları</Link>
            {' '}ve{' '}
            <Link to="/gizlilik" className={styles.termsLink}>Gizlilik Politikası</Link>
            'nı kabul etmiş olursunuz.
          </p>

          <button className={styles.primary} disabled={isLoading}>
            {isLoading ? 'Hesap oluşturuluyor…' : 'Ücretsiz Başla →'}
          </button>
        </form>

        <div className={styles.footer}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className={styles.link}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
