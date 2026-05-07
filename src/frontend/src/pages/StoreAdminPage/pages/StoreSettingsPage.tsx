import { useState } from 'react';
import styles from './StoreSettingsPage.module.css';

export const StoreSettingsPage = () => {
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Mağaza Ayarları</h2>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Mağaza Adı</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Mağazanızın adını girin"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Mağaza Slug</label>
            <input
              type="text"
              className={styles.input}
              placeholder="ornek-magaza"
              value={storeSlug}
              onChange={(e) => setStoreSlug(e.target.value)}
            />
            <span className={styles.hint}>
              Mağazanızın URL'de görünecek kısa adı (sadece küçük harf ve tire)
            </span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Logo URL</label>
            <input
              type="url"
              className={styles.input}
              placeholder="https://ornek.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled>
              Kaydet (Yakında)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
