import styles from './PlaceholderPage.module.css';

export const StoreOrdersPage = () => {
  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Siparişler</h2>
      <div className={styles.placeholderCard}>
        <p className={styles.placeholderText}>Siparişler yakında...</p>
      </div>
    </div>
  );
};
