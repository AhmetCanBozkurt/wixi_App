import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from './CheckoutCancelPage.module.css';

export const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <FaExclamationTriangle />
        </div>

        <h1 className={styles.title}>Ödeme İptal Edildi</h1>

        <p className={styles.description}>
          Ödeme işlemi tamamlanmadı. Herhangi bir ücret tahsil edilmedi.
          <br />
          Dilediğiniz zaman tekrar deneyebilirsiniz.
        </p>

        <button className={styles.button} onClick={() => navigate('/')}>
          Planlara Geri Dön
        </button>
      </div>
    </div>
  );
};
