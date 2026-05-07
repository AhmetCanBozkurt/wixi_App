import styles from './StoreDashboardPage.module.css';

interface StatCard {
  label: string;
  value: string;
}

const statCards: StatCard[] = [
  { label: 'Toplam Sipariş', value: '—' },
  { label: 'Toplam Müşteri', value: '—' },
  { label: 'Toplam Gelir', value: '—' },
];

export const StoreDashboardPage = () => {
  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Dashboard</h2>

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <span className={styles.statLabel}>{card.label}</span>
            <span className={styles.statValue}>{card.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.placeholderCard}>
        <p className={styles.placeholderText}>
          Sipariş ve gelir grafikleri yakında burada görünecek.
        </p>
      </div>
    </div>
  );
};
