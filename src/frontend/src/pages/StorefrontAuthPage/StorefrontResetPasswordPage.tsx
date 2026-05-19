import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../../entities/Customer/api/customerApi';
import styles from './StorefrontAuthPage.module.css';

export const StorefrontResetPasswordPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Geçersiz Bağlantı</h1>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '20px' }}>
            Bu şifre sıfırlama bağlantısı geçersiz veya eksik.
          </p>
          <p className={styles.switchText}>
            <Link to={`/store/${tenantSlug}/forgot-password`} className={styles.link}>
              Yeni Bağlantı Talep Et
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;

    setValidationError('');

    if (newPassword !== confirmPassword) {
      setValidationError('Şifreler uyuşmuyor.');
      return;
    }

    setIsLoading(true);
    try {
      await customerApi.resetPassword(tenantSlug, { token, newPassword });
      toast.success('Şifreniz başarıyla güncellendi.');
      navigate(`/store/${tenantSlug}/login`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const message = axiosErr?.response?.data?.error;
      if (message) {
        setValidationError('Bağlantı geçersiz veya süresi dolmuş, yeniden talep edin.');
      } else {
        toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Yeni Şifre Belirle</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Yeni Şifre</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Şifre Tekrar</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {validationError && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{validationError}</p>
          )}
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
          </button>
        </form>
        <p className={styles.switchText}>
          <Link to={`/store/${tenantSlug}/login`} className={styles.link}>
            Girişe Dön
          </Link>
        </p>
      </div>
    </div>
  );
};
