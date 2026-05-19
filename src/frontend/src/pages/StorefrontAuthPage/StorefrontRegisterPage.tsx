import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../../entities/Customer/api/customerApi';
import styles from './StorefrontAuthPage.module.css';

export const StorefrontRegisterPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;
    if (form.password !== form.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }
    setIsLoading(true);
    try {
      await customerApi.register(tenantSlug, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate(`/store/${tenantSlug}/login`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Kayıt Ol</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Ad</label>
              <input type="text" name="firstName" className={styles.input} value={form.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Soyad</label>
              <input type="text" name="lastName" className={styles.input} value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>E-posta</label>
            <input type="email" name="email" className={styles.input} value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Şifre</label>
            <input type="password" name="password" className={styles.input} value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Şifre Tekrar</label>
            <input type="password" name="passwordConfirm" className={styles.input} value={form.passwordConfirm} onChange={handleChange} required />
          </div>
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className={styles.switchText}>
          Zaten hesabınız var mı?{' '}
          <Link to={`/store/${tenantSlug}/login`} className={styles.link}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};
