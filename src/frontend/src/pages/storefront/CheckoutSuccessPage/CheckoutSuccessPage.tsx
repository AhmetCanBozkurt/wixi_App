import { useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './CheckoutSuccessPage.module.css';

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();

  const tenant = searchParams.get('tenant') ?? '';
  const paid = searchParams.get('paid') === 'true';

  const handleLoginClick = () => {
    const loginUrl = tenant
      ? `/login?tenant=${encodeURIComponent(tenant)}`
      : '/login';
    window.location.href = loginUrl;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FaCheckCircle />
        </div>

        <h1 className={styles.title}>
          {paid ? 'Ödeme Başarılı ✓' : 'Siparişiniz Alındı!'}
        </h1>

        <p className={styles.description}>
          {paid
            ? 'Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacak.'
            : 'Siparişiniz alındı ve mağazanız hazırlanıyor.'}
          <br />
          Aşağıdaki butona tıklayarak mağaza panelinize giriş yapabilirsiniz.
        </p>

        {tenant && (
          <span className={styles.tenantBadge}>{tenant}</span>
        )}

        <button className={styles.button} onClick={handleLoginClick}>
          Mağaza Panelinize Giriş Yapın
        </button>
      </div>
    </div>
  );
};
