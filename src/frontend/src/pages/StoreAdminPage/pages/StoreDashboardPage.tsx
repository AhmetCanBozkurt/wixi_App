import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTags,
  FaTrademark,
  FaUsers,
  FaExclamationTriangle,
} from 'react-icons/fa';
import styles from './StoreDashboardPage.module.css';

interface DashboardStats {
  productCount: number;
  activeProductCount: number;
  categoryCount: number;
  brandCount: number;
  customerCount: number;
  lowStockCount: number;
}

interface StatCardDef {
  key: keyof DashboardStats;
  label: string;
  icon: React.ReactNode;
  isWarning?: boolean;
}

const statCardDefs: StatCardDef[] = [
  { key: 'productCount', label: 'Toplam Ürün', icon: <FaBoxOpen /> },
  { key: 'activeProductCount', label: 'Aktif Ürün', icon: <FaCheckCircle /> },
  { key: 'categoryCount', label: 'Kategori', icon: <FaTags /> },
  { key: 'brandCount', label: 'Marka', icon: <FaTrademark /> },
  { key: 'customerCount', label: 'Müşteri', icon: <FaUsers /> },
  {
    key: 'lowStockCount',
    label: 'Düşük Stok Uyarısı',
    icon: <FaExclamationTriangle />,
    isWarning: true,
  },
];

const storeApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export const StoreDashboardPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeToken = localStorage.getItem('token');
        const res = await storeApiClient.get<DashboardStats>(
          '/store-admin/dashboard/stats',
          {
            headers: {
              Authorization: storeToken ? `Bearer ${storeToken}` : undefined,
              'X-Tenant-Slug': tenantSlug ?? '',
            },
          },
        );
        setStats(res.data);
      } catch {
        setError('İstatistikler yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, [tenantSlug]);

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Dashboard</h2>

      {isLoading && (
        <div className={styles.loadingBox}>
          <p className={styles.loadingText}>İstatistikler yükleniyor...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {!isLoading && !error && stats && (
        <div className={styles.statsGrid}>
          {statCardDefs.map((def) => {
            const value = stats[def.key];
            const isWarn = def.isWarning && value > 0;
            return (
              <div
                key={def.key}
                className={`${styles.statCard}${isWarn ? ` ${styles.statCardWarning}` : ''}`}
              >
                <div className={`${styles.statIcon}${isWarn ? ` ${styles.statIconWarning}` : ''}`}>
                  {def.icon}
                </div>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{def.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && !stats && (
        <div className={styles.placeholderCard}>
          <p className={styles.placeholderText}>
            Henüz veri bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
};
