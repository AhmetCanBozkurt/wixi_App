import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaCog, FaGlobe, FaBullhorn, FaEnvelope, FaSave, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import styles from './StoreSettingsPage.module.css';

interface StoreSettings {
  id?: string;
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinksJson?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string;
}

const storeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export const StoreSettingsPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [settings, setSettings] = useState<StoreSettings>({ storeName: '' });
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo' | 'social'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getHeaders = useCallback(() => {
    const storeToken = localStorage.getItem('token');
    return {
      Authorization: storeToken ? `Bearer ${storeToken}` : '',
      'X-Tenant-Slug': tenantSlug ?? '',
    };
  }, [tenantSlug]);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeApi.get<StoreSettings>('/store-admin/settings', {
        headers: getHeaders(),
      });
      setSettings(res.data);
    } catch {
      toast.error('Ayarlar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings.storeName) {
      toast.error('Mağaza adı zorunludur.');
      return;
    }

    setIsSaving(true);
    try {
      await storeApi.put('/store-admin/settings', settings, {
        headers: getHeaders(),
      });
      toast.success('Ayarlar kaydedildi.');
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className={styles.loading}>Yükleniyor...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <FaCog className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>Mağaza Ayarları</h2>
            <p className={styles.subtitle}>Mağazanızın kimliğini ve genel yapılandırmasını yönetin</p>
          </div>
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
          <FaSave /> {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaGlobe /> Genel
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'contact' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <FaEnvelope /> İletişim
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'seo' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            <FaBullhorn /> SEO
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'general' && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Mağaza Adı *</label>
                <input 
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  placeholder="Mağazanızın görünen adı"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Logo URL</label>
                <div className={styles.inputWithIcon}>
                  <FaImage />
                  <input 
                    name="logoUrl"
                    value={settings.logoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Favicon URL</label>
                <input 
                  name="faviconUrl"
                  value={settings.faviconUrl || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>E-posta Adresi</label>
                <input 
                  name="contactEmail"
                  value={settings.contactEmail || ''}
                  onChange={handleChange}
                  placeholder="destek@magazaniz.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Telefon</label>
                <input 
                  name="contactPhone"
                  value={settings.contactPhone || ''}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className={styles.formGroupFull}>
                <label>Adres</label>
                <textarea 
                  name="address"
                  value={settings.address || ''}
                  onChange={handleChange}
                  placeholder="Mağaza adresi"
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label>SEO Başlığı (Title)</label>
                <input 
                  name="seoTitle"
                  value={settings.seoTitle || ''}
                  onChange={handleChange}
                  placeholder="Arama motorlarında görünecek başlık"
                />
              </div>
              <div className={styles.formGroupFull}>
                <label>SEO Açıklaması (Description)</label>
                <textarea 
                  name="seoDescription"
                  value={settings.seoDescription || ''}
                  onChange={handleChange}
                  placeholder="Arama motorlarında görünecek kısa açıklama"
                  rows={3}
                />
              </div>
              <div className={styles.formGroupFull}>
                <label>Anahtar Kelimeler (Keywords)</label>
                <input 
                  name="keywords"
                  value={settings.keywords || ''}
                  onChange={handleChange}
                  placeholder="E-ticaret, Giyim, Ayakkabı..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
