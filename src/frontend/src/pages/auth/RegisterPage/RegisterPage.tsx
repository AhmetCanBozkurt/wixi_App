import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useTheme } from '../../../app/providers/ThemeProvider';
import styles from './RegisterPage.module.css';

const schema = z.object({
  storeName: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır').max(100, 'İşletme adı en az 100 karakter olmalıdır'),
  email: z.string().min(1, 'E-posta zorunludur').email('Geçerli bir e-posta girin'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir')
    .regex(/[^A-Za-z0-9]/, 'En az bir özel karakter içermelidir'),
  passwordConfirm: z.string().min(1, 'Şifre tekrarı zorunludur'),
  kvkk: z.literal(true, {
    errorMap: () => ({ message: 'Kullanım şartlarını ve KVKK metnini onaylamanız gerekiyor.' }),
  }),
  news: z.boolean().optional(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['passwordConfirm'],
});

type FormData = z.infer<typeof schema>;

const trMap: Record<string, string> = {
  'ç': 'c', 'Ç': 'c',
  'ğ': 'g', 'Ğ': 'g',
  'ı': 'i', 'I': 'i',
  'İ': 'i',
  'ö': 'o', 'Ö': 'o',
  'ş': 's', 'Ş': 's',
  'ü': 'u', 'Ü': 'u'
};

const slugify = (text: string) => {
  let str = text;
  for (const key in trMap) {
    str = str.replaceAll(key, trMap[key]);
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  
  const map = [
    { label: 'Çok zayıf', color: 'var(--color-danger)' },
    { label: 'Zayıf', color: '#f87171' },
    { label: 'Orta', color: '#fbbf24' },
    { label: 'Güçlü', color: '#a5b4fc' },
    { label: 'Çok Güçlü', color: 'var(--color-success)' },
  ];
  return { score, ...map[score] };
}

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      news: false,
    }
  });

  const pwVal = watch('password', '');
  const strength = getStrength(pwVal);
  const storeNameVal = watch('storeName', '');
  const slugPreview = storeNameVal ? slugify(storeNameVal) : '';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/saas/onboarding/send-otp', {
        email: data.email,
      });

      sessionStorage.setItem('wixi-signup-store-name', data.storeName);
      sessionStorage.setItem('wixi-signup-slug', slugify(data.storeName));
      sessionStorage.setItem('wixi-signup-email', data.email);
      sessionStorage.setItem('wixi-signup-password', data.password);
      
      if (response.data?.devCode) {
        sessionStorage.setItem('wixi-signup-devcode', response.data.devCode);
      }

      toast.success('Doğrulama kodu gönderildi!');
      navigate('/verify-email');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; errorMessage?: string } } };
      const msg = err?.response?.data?.error || err?.response?.data?.errorMessage || 'Kayıt işlemi başlatılamadı. E-posta zaten kullanımda olabilir.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden={true}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={`${styles.orb} ${styles.orb3}`}></div>
      </div>

      <header className={styles.authTop}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span className={styles.brandName}>WIXI<span className={styles.dim}>APP</span></span>
        </Link>
        <div className={styles.headerRight}>
          <span className={styles.hasAccountText}>Zaten üye misiniz?</span>
          <Link to="/login" className={styles.btnGhostSm}>Giriş Yap</Link>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Tema değiştir">
            {theme === 'light' ? (
              <svg className={styles.moon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg className={styles.sun} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className={styles.authMain}>
        <div className={styles.authLayout}>
          <div className={styles.benefits}>
            <span className={styles.eyebrow}>
              <span className={styles.dot}></span>14 gün ücretsiz
            </span>
            <h2 className={styles.benefitsTitle}>
              İşletmenizin <span className={styles.gradText}>tüm dijital alt yapısı</span> tek panelde.
            </h2>
            <p className={styles.benefitsDesc}>
              E-Ticaret'ten İK'ya, CRM'den muhasebeye — 35+ modül istediğiniz an açık veya kapalı.
            </p>

            <ul className={styles.benefitsList}>
              <li>
                <span className={styles.bIc}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <div>
                  <b>Kredi kartı gerekmez</b>
                  <span>14 gün hiçbir ödeme yapmadan deneyin.</span>
                </div>
              </li>
              <li>
                <span className={styles.bIc}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <div>
                  <b>2 dakikada kurulum</b>
                  <span>Hemen mağazanızı açın, ürünlerinizi ekleyin.</span>
                </div>
              </li>
              <li>
                <span className={styles.bIc}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <div>
                  <b>İstediğiniz an iptal</b>
                  <span>Otomatik ödeme yok, taahhüt yok.</span>
                </div>
              </li>
              <li>
                <span className={styles.bIc}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <div>
                  <b>KVKK uyumlu, Türkiye'de host</b>
                  <span>ISO 27001 sertifikalı veri merkezi.</span>
                </div>
              </li>
            </ul>

            <div className={styles.benefitsTrust}>
              <div className={styles.avs}>
                <span>AY</span>
                <span>MK</span>
                <span>ED</span>
              </div>
              <div>
                <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '14px' }}>1,250+ aktif işletme</div>
                <div><span className={styles.stars}>★★★★★</span> 4.9 / 5 ortalama puan</div>
              </div>
            </div>
          </div>

          <div className={`${styles.authCard} ${styles.glass}`}>
            <div className={styles.authHead}>
              <h1>Hesabınızı oluşturun</h1>
              <p>14 gün ücretsiz — sonra siz karar verin</p>
            </div>

            <div className={styles.socialBtns}>
              <button className={styles.socialBtn} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5c1.9 0 3.6.7 4.9 1.9l3.1-3C18.05 2.1 15.27 1 12 1 7.3 1 3.25 3.7 1.3 7.7l4 3.1c.93-2.8 3.55-4.9 6.7-4.9z"/><path fill="#34A853" d="M16.04 18.04c-1.1.7-2.5 1.1-4.04 1.1-3.1 0-5.74-2.1-6.7-4.9l-4 3.1C3.25 21.3 7.3 24 12 24c3.15 0 5.92-1 7.9-2.8l-3.86-3.16z"/><path fill="#4A90E2" d="M19.9 21.2c2.06-1.92 3.4-4.78 3.4-8.2 0-.62-.05-1.22-.15-1.8H12v3.4h6.45c-.28 1.4-1.13 2.6-2.4 3.44l3.85 3.16z"/><path fill="#FBBC05" d="M5.3 14.24a7.1 7.1 0 0 1 0-4.48l-4-3.1A12 12 0 0 0 0 12c0 1.94.46 3.78 1.3 5.4l4-3.16z"/></svg>
                Google
              </button>
              <button className={styles.socialBtn} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>

            <div className={styles.divWithText}>veya</div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="storeName">İşletme adı</label>
                <input
                  id="storeName"
                  type="text"
                  placeholder="Örnek: Mavi Tekstil"
                  className={errors.storeName ? styles.inputError : ''}
                  {...register('storeName')}
                />
                {errors.storeName && <span className={styles.err}>{errors.storeName.message}</span>}
                {slugPreview && (
                  <span className={styles.slugPreview}>
                    Mağaza adresi: <strong>{slugPreview}.wixi.app</strong>
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="email">E-posta</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ad@isletme.com"
                  autoComplete="email"
                  className={errors.email ? styles.inputError : ''}
                  {...register('email')}
                />
                {errors.email && <span className={styles.err}>{errors.email.message}</span>}
              </div>

              <div className={`${styles.field} ${styles.withIc}`}>
                <label htmlFor="password">Şifre</label>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="En az 8 karakter"
                  autoComplete="new-password"
                  className={errors.password ? styles.inputError : ''}
                  {...register('password')}
                />
                <button type="button" className={styles.reveal} onClick={() => setShowPw(!showPw)} aria-label="Şifreyi göster">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>

              {pwVal.length > 0 && (
                <div className={styles.strength}>
                  <div className={styles.strengthBar}>
                    <div style={{ 
                      width: `${pwVal.length === 0 ? 0 : strength.score === 0 ? 20 : strength.score * 25}%`,
                      background: strength.color 
                    }}></div>
                  </div>
                  <div className={styles.strengthMeta}>
                    <span>Şifre gücü: <b style={{ color: strength.color }}>{strength.label}</b></span>
                    <span>8+ karakter, harf+sayı+sembol</span>
                  </div>
                </div>
              )}
              {errors.password && <span className={styles.err}>{errors.password.message}</span>}

              <div className={styles.field}>
                <label htmlFor="passwordConfirm">Şifre Tekrar</label>
                <input
                  id="passwordConfirm"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Şifrenizi tekrar girin"
                  className={errors.passwordConfirm ? styles.inputError : ''}
                  {...register('passwordConfirm')}
                />
                {errors.passwordConfirm && <span className={styles.err}>{errors.passwordConfirm.message}</span>}
              </div>

              <label className={styles.cb}>
                <input type="checkbox" id="kvkk" {...register('kvkk')} />
                <span className={styles.box}></span>
                <span>
                  <Link to="/kullanim-sartlari" target="_blank">Kullanım şartlarını</Link> ve{' '}
                  <Link to="/kvkk" target="_blank">KVKK aydınlatma metnini</Link> okudum, kabul ediyorum.
                </span>
              </label>
              {errors.kvkk && <span className={styles.err}>{errors.kvkk.message}</span>}

              <label className={styles.cb}>
                <input type="checkbox" id="news" {...register('news')} />
                <span className={styles.box}></span>
                <span>Yeni özellikler ve kampanyalardan haberdar olmak istiyorum.</span>
              </label>

              <button type="submit" className={styles.primary} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
                      <path d="M21 12a9 9 0 0 1-9 9"/>
                    </svg>
                    Hesap oluşturuluyor...
                  </>
                ) : 'Hesabımı Oluştur →'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
