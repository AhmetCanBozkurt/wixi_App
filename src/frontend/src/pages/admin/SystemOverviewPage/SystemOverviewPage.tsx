import styles from './SystemOverviewPage.module.css';

export const SystemOverviewPage = () => {
  return (
    <div className={styles.wrapper}>
      <iframe
        src="/system-overview.html"
        className={styles.frame}
        title="Sistem Mimarisi & Veri Akışı"
      />
    </div>
  );
};
