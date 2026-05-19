import { Link, useParams } from 'react-router-dom';
import styles from './StorefrontOrderSuccessPage.module.css';

export const StorefrontOrderSuccessPage = () => {
  const { tenantSlug, orderNumber } = useParams<{ tenantSlug: string; orderNumber: string }>();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="64" height="64">
            <circle cx="12" cy="12" r="10" />
            <path d="M7 12.5l3.5 3.5 7-7" />
          </svg>
        </div>
        <h1 className={styles.title}>Siparişiniz Alındı!</h1>
        <p className={styles.subtitle}>Siparişiniz başarıyla oluşturuldu.</p>
        {orderNumber && (
          <div className={styles.orderNumber}>
            <span>Sipariş No:</span>
            <strong>{orderNumber}</strong>
          </div>
        )}
        <p className={styles.note}>
          Siparişinizin durumunu hesabınızdan takip edebilirsiniz.
        </p>
        <div className={styles.actions}>
          <Link to={`/store/${tenantSlug}`} className={styles.primaryBtn}>
            Alışverişe Devam Et
          </Link>
          <Link to={`/store/${tenantSlug}/account`} className={styles.secondaryBtn}>
            Hesabım
          </Link>
        </div>
      </div>
    </div>
  );
};
