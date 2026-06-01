import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import styles from './PaymentFailedPage.module.css';

export const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const errorMessage = searchParams.get('error') ?? 'Ödeme işlemi tamamlanamadı.';

  const handleRetry = () => {
    if (tenantSlug) {
      navigate(`/store/${tenantSlug}/checkout`);
    } else {
      navigate(-1);
    }
  };

  const handleOrders = () => {
    if (tenantSlug) {
      navigate(`/store/${tenantSlug}/account`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FaTimesCircle />
        </div>

        <h1 className={styles.title}>Ödeme Başarısız</h1>

        <p className={styles.description}>{errorMessage}</p>

        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={handleRetry}>
            Tekrar Dene
          </button>
          <button className={styles.ordersBtn} onClick={handleOrders}>
            Siparişlerim
          </button>
        </div>
      </div>
    </div>
  );
};
