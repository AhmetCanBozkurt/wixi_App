import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './CheckoutSuccessPage.module.css';

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tenant = searchParams.get('tenant') ?? '';

  const handleGoToStore = () => {
    const target = tenant
      ? `/store-login?tenant=${encodeURIComponent(tenant)}`
      : '/store-login';
    navigate(target);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FaCheckCircle />
        </div>

        <h1 className={styles.title}>Ödemeniz Başarıyla Tamamlandı!</h1>

        <p className={styles.description}>
          Siparişiniz alındı ve mağazanız hazırlanıyor.
          <br />
          Aşağıdaki butona tıklayarak mağaza panelinize giriş yapabilirsiniz.
        </p>

        {tenant && (
          <span className={styles.tenantBadge}>{tenant}</span>
        )}

        <button className={styles.button} onClick={handleGoToStore}>
          Mağaza Panelinize Giriş Yapın
        </button>
      </div>
    </div>
  );
};
