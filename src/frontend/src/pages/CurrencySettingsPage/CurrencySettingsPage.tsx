import { useState, useEffect } from 'react';
import { FaCog, FaSync, FaSave, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { Card, Button, Select, Switch, Badge } from '../../shared/ui';
import styles from './CurrencySettingsPage.module.css';

interface CurrencySettings {
  id: string;
  baseCurrencyCode: string;
  tcmbAutoSyncEnabled: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
}

export const CurrencySettingsPage = () => {
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localBase, setLocalBase] = useState('');
  const [localAutoSync, setLocalAutoSync] = useState(true);

  const fetchData = async () => {
    try {
      const [settingsRes, currRes] = await Promise.all([
        apiClient.get<CurrencySettings>('currency/settings'),
        apiClient.get<{ items: Currency[] }>('currency?activeOnly=true')
      ]);
      setSettings(settingsRes.data);
      setLocalBase(settingsRes.data.baseCurrencyCode);
      setLocalAutoSync(settingsRes.data.tcmbAutoSyncEnabled);
      setCurrencies(currRes.data.items || []);
    } catch {
      toast.error('Ayarlar yüklenemedi.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currencyOptions = currencies.map(c => ({
    label: `${c.code} — ${c.name}`,
    value: c.code
  }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put('currency/settings', {
        baseCurrencyCode: localBase,
        tcmbAutoSyncEnabled: localAutoSync
      });
      toast.success('Ayarlar kaydedildi.');
      await fetchData();
    } catch {
      toast.error('Ayarlar kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiClient.post('exchange-rates/sync-tcmb', {});
      const data = res.data;
      if (data.status === 'Success') {
        toast.success(`Senkronizasyon tamamlandı. ${data.ratesSaved} kur güncellendi.`);
      } else if (data.status === 'Holiday') {
        toast.success('Bugün resmi tatil — TCMB kur yayınlamadı.');
      } else {
        toast.error(`Hata: ${data.errorMessage || data.status}`);
      }
      await fetchData();
    } catch {
      toast.error('Manuel senkronizasyon başarısız.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="default" size="sm">Bilinmiyor</Badge>;
    if (status === 'Success') return <Badge variant="success" size="sm" showDot>Başarılı</Badge>;
    if (status === 'Holiday') return <Badge variant="warning" size="sm" showDot>Tatil</Badge>;
    return <Badge variant="danger" size="sm" showDot>{status}</Badge>;
  };

  const getNextSync = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(16, 0, 0, 0);
    if (now.getHours() >= 16) {
      next.setDate(next.getDate() + 1);
      // Skip weekends
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
    }
    return next.toLocaleString('tr-TR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaCog className={styles.mainIcon} />
          <div>
            <h1>Para Birimi Ayarları</h1>
            <p>TCMB senkronizasyonu ve sistem para birimi tercihlerini yapılandırın.</p>
          </div>
        </div>
        <Button
          variant="secondary"
          leftIcon={<FaSync className={isSyncing ? styles.spinning : ''} />}
          onClick={handleManualSync}
          isLoading={isSyncing}
        >
          Manuel Senkronize Et
        </Button>
      </div>

      <div className={styles.settingsWrapper}>

        {/* Temel Ayarlar */}
        <Card
          title="Temel Ayarlar"
          subtitle="Sistem ana para birimi ve otomatik senkronizasyon"
          headerAction={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FaSave />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Kaydet
            </Button>
          }
        >
          <div className={styles.cardContent}>
            <Select
              label="Ana Para Birimi"
              options={currencyOptions}
              value={localBase}
              onChange={v => setLocalBase(String(v))}
              placeholder="Para birimi seçin..."
              required
            />
            <Switch
              label="Otomatik TCMB Senkronizasyonu"
              description="Her hafta içi 16:00'da TCMB'den otomatik kur çeker."
              checked={localAutoSync}
              onChange={e => setLocalAutoSync(e.target.checked)}
            />
          </div>
        </Card>

        {/* Senkronizasyon Durumu */}
        <Card title="Senkronizasyon Durumu" subtitle="Son senkronizasyon bilgileri">
          <div className={styles.statusGrid}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Son Senkronizasyon</span>
              <span className={styles.statusValue}>
                {settings?.lastSyncedAt
                  ? new Date(settings.lastSyncedAt).toLocaleString('tr-TR')
                  : 'Henüz yapılmadı'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Son Durum</span>
              <span className={styles.statusValue}>
                {getStatusBadge(settings?.lastSyncStatus)}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Sonraki Otomatik Sync</span>
              <span className={styles.statusValue}>
                {localAutoSync
                  ? <span className={styles.nextSync}><FaCalendarAlt size={12} /> {getNextSync()}</span>
                  : <Badge variant="danger" size="sm">Devre Dışı</Badge>}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Ana Para Birimi</span>
              <span className={styles.statusValue}>
                <code className={styles.baseCurrencyCode}>{settings?.baseCurrencyCode || '—'}</code>
              </span>
            </div>
          </div>
        </Card>

        {/* Genel Bilgi */}
        <Card title="Genel Bilgi">
          <div className={styles.infoNote}>
            <p>
              <strong>TCMB Kur Saati:</strong> Türkiye Cumhuriyet Merkez Bankası döviz kurlarını hafta içi
              yaklaşık <strong>15:30</strong>'da yayınlamaktadır. Otomatik senkronizasyon her hafta içi
              saat <strong>16:00</strong>'da çalışır.
            </p>
            <p>
              <strong>Tatil Günleri:</strong> Resmi tatillerde TCMB kur yayınlamaz; bu durumlarda sistem
              son geçerli kurları korur ve senkronizasyon durumu "Tatil" olarak kaydedilir.
            </p>
            <p>
              <strong>Parite Hesabı:</strong> Tüm kurlar TRY bazlıdır. Farklı iki yabancı para birimi
              arasındaki parite, her birinin TRY değerinden çapraz olarak hesaplanır.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
};
