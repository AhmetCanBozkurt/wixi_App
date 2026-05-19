import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../../entities/Customer/api/customerApi';
import { useCustomerStore } from '../../entities/Customer/model/store';
import styles from './StorefrontAuthPage.module.css';

export const StorefrontLoginPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { login } = useCustomerStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;
    setIsLoading(true);
    try {
      const res = await customerApi.login(tenantSlug, { email, password });
      login(res.data.token, res.data.customer, tenantSlug);
      toast.success('Giriş yapıldı!');
      navigate(`/store/${tenantSlug}`);
    } catch {
      toast.error('E-posta veya şifre hatalı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Giriş Yap</h1>
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
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Şifre</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: '-8px' }}>
            <Link to={`/store/${tenantSlug}/forgot-password`} className={styles.link}>
              Şifremi Unuttum
            </Link>
          </div>
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className={styles.switchText}>
          Hesabınız yok mu?{' '}
          <Link to={`/store/${tenantSlug}/register`} className={styles.link}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};
