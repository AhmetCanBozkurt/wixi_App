import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaArrowUp, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styles from './StoreBillingPage.module.css';

interface SubscriptionInfo {
  planName: string;
  status: string;
  expiresAt: string | null;
}

const storeApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const StoreBillingPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeToken = localStorage.getItem('token');
        const res = await storeApiClient.get<SubscriptionInfo>('/saas/subscription', {
          headers: {
            Authorization: storeToken ? `Bearer ${storeToken}` : undefined,
            'X-Tenant-Slug': tenantSlug ?? '',
          },
        });
        setSubscription(res.data);
      } catch {
        setError('Abonelik bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [tenantSlug]);

  const isActive = subscription?.status?.toLowerCase() === 'active';

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Fatura & Abonelik</h2>

      {isLoading && (
        <div className={styles.card}>
          <p className={styles.loadingText}>Abonelik bilgileri yükleniyor...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {!isLoading && !error && subscription && (
        <div className={styles.card}>
          <div className={styles.planRow}>
            <div>
              <span className={styles.planLabel}>Mevcut Plan</span>
              <h3 className={styles.planName}>{subscription.planName}</h3>
            </div>
            <div className={isActive ? styles.badgeActive : styles.badgeInactive}>
              {isActive ? <FaCheckCircle /> : <FaTimesCircle />}
              {isActive ? 'Aktif' : subscription.status}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Bitiş Tarihi</span>
            <span className={styles.infoValue}>{formatDate(subscription.expiresAt)}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.upgradeButton}>
              <FaArrowUp />
              Plan Yükselt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
