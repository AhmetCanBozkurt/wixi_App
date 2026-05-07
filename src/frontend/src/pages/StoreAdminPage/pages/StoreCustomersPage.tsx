import styles from './PlaceholderPage.module.css';

export const StoreCustomersPage = () => {
  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Müşteriler</h2>
      <div className={styles.placeholderCard}>
        <p className={styles.placeholderText}>Müşteriler yakında...</p>
      </div>
    </div>
  );
};
