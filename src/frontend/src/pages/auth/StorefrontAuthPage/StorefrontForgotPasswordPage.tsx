import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../../../entities/Customer/api/customerApi';
import styles from './StorefrontAuthPage.module.css';

export const StorefrontForgotPasswordPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;
    setIsLoading(true);
    try {
      await customerApi.forgotPassword(tenantSlug, { email });
      setSubmitted(true);
    } catch {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Şifremi Unuttum</h1>
        {submitted ? (
          <div>
            <p style={{ color: '#16a34a', textAlign: 'center', marginBottom: '20px', fontWeight: 600 }}>
              E-posta gönderildi, gelen kutunuzu kontrol edin.
            </p>
            <p className={styles.switchText}>
              <Link to={`/store/${tenantSlug}/login`} className={styles.link}>
                Girişe Dön
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>E-posta</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="ornek@eposta.com"
                />
              </div>
              <button type="submit" className={styles.btn} disabled={isLoading}>
                {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
            </form>
            <p className={styles.switchText}>
              <Link to={`/store/${tenantSlug}/login`} className={styles.link}>
                Girişe Dön
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
