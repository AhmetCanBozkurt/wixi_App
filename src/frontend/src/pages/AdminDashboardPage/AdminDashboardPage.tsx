import { useEffect, useState } from 'react';
import { FaStore, FaCheckCircle, FaCalendarPlus, FaUsers } from 'react-icons/fa';
import apiClient from '../../shared/api/axiosConfig';
import styles from './AdminDashboardPage.module.css';

// ---- Types ----

interface SubscriptionsByStatus {
  trial: number;
  active: number;
  cancelled: number;
  pastDue: number;
}

interface PlanDistributionItem {
  planName: string;
  code: string;
  count: number;
  percentage: number;
}

interface RecentTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  newTenantsThisMonth: number;
  totalUsers: number;
  subscriptionsByStatus: SubscriptionsByStatus;
  planDistribution: PlanDistributionItem[];
  totalRevenue: number;
  revenueThisMonth: number;
  recentTenants: RecentTenant[];
}

// ---- Helpers ----

function formatCurrency(amount: number): string {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function getProgressClass(code: string): string {
  if (code === 'free')    return styles.free;
  if (code === 'starter') return styles.starter;
  if (code === 'pro')     return styles.pro;
  return styles.default;
}

function getBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'trial')     return styles.trial;
  if (normalized === 'active')    return styles.active;
  if (normalized === 'cancelled') return styles.cancelled;
  if (normalized === 'pastdue')   return styles.pastDue;
  return styles.default;
}

// ---- Sub-components ----

interface StatCardProps {
  icon: React.ReactNode;
  iconVariant: 'blue' | 'green' | 'orange' | 'purple';
  value: number;
  label: string;
}

const StatCard = ({ icon, iconVariant, value, label }: StatCardProps) => (
  <div className={styles.statCard}>
    <div className={`${styles.statIconBox} ${styles[iconVariant]}`}>{icon}</div>
    <span className={styles.statValue}>{value.toLocaleString('tr-TR')}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

interface RevenueCardProps {
  label: string;
  amount: number;
  subtitle?: string;
}

const RevenueCard = ({ label, amount, subtitle }: RevenueCardProps) => (
  <div className={styles.revenueCard}>
    <span className={styles.revenueLabel}>{label}</span>
    <div className={styles.revenueAmount}>
      <span className={styles.revenuePrefix}>₺</span>
      {formatCurrency(amount)}
    </div>
    {subtitle && <p className={styles.revenueSubtitle}>{subtitle}</p>}
  </div>
);

// ---- Main Page ----

export const AdminDashboardPage = () => {
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
        setStats(res.data);
      } catch {
        setError('Dashboard istatistikleri yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  return (
    <div className={styles.page}>
      <div>
        <h2 className={styles.pageTitle}>Platform Dashboard</h2>
        <p className={styles.pageSubtitle}>Genel SaaS platform metrikleri</p>
      </div>

      {isLoading && (
        <div className={styles.loadingBox}>
          <p className={styles.loadingText}>İstatistikler yükleniyor...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {!isLoading && !error && stats && (
        <>
          {/* Row 1 — 4 stat cards */}
          <div className={styles.statsGrid}>
            <StatCard
              icon={<FaStore />}
              iconVariant="blue"
              value={stats.totalTenants}
              label="Toplam Mağaza"
            />
            <StatCard
              icon={<FaCheckCircle />}
              iconVariant="green"
              value={stats.activeTenants}
              label="Aktif Mağaza"
            />
            <StatCard
              icon={<FaCalendarPlus />}
              iconVariant="orange"
              value={stats.newTenantsThisMonth}
              label="Bu Ay Yeni"
            />
            <StatCard
              icon={<FaUsers />}
              iconVariant="purple"
              value={stats.totalUsers}
              label="Toplam Kullanıcı"
            />
          </div>

          {/* Row 2 — Revenue cards */}
          <div className={styles.revenueGrid}>
            <RevenueCard
              label="Toplam Ciro"
              amount={stats.totalRevenue}
            />
            <RevenueCard
              label="Bu Ay Ciro"
              amount={stats.revenueThisMonth}
              subtitle="Başarılı ödemeler"
            />
          </div>

          {/* Row 3 — Subscription status + Plan distribution */}
          <div className={styles.splitGrid}>
            {/* Left: Subscription status */}
            <div className={styles.panelCard}>
              <p className={styles.panelTitle}>Abonelik Durumu</p>
              <div className={styles.statusList}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>
                    <span className={`${styles.statusDot} ${styles.trial}`} />
                    Trial
                  </span>
                  <span className={styles.statusCount}>{stats.subscriptionsByStatus.trial}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>
                    <span className={`${styles.statusDot} ${styles.active}`} />
                    Aktif
                  </span>
                  <span className={styles.statusCount}>{stats.subscriptionsByStatus.active}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>
                    <span className={`${styles.statusDot} ${styles.cancelled}`} />
                    İptal
                  </span>
                  <span className={styles.statusCount}>{stats.subscriptionsByStatus.cancelled}</span>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>
                    <span className={`${styles.statusDot} ${styles.pastDue}`} />
                    Vadesi Geçmiş
                  </span>
                  <span className={styles.statusCount}>{stats.subscriptionsByStatus.pastDue}</span>
                </div>
              </div>
            </div>

            {/* Right: Plan distribution */}
            <div className={styles.panelCard}>
              <p className={styles.panelTitle}>Plan Dağılımı</p>
              {stats.planDistribution.length === 0 ? (
                <p className={styles.placeholderText}>Henüz abonelik verisi yok.</p>
              ) : (
                <div className={styles.planList}>
                  {stats.planDistribution.map((plan) => (
                    <div key={plan.code} className={styles.planRow}>
                      <div className={styles.planMeta}>
                        <span className={styles.planName}>{plan.planName}</span>
                        <span className={styles.planCount}>
                          {plan.count} mağaza · %{plan.percentage}
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${getProgressClass(plan.code)}`}
                          style={{ width: `${plan.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4 — Recent tenants table */}
          <div className={styles.tableCard}>
            <p className={styles.tableTitle}>Son Kayıt Olan Mağazalar</p>
            {stats.recentTenants.length === 0 ? (
              <div className={styles.placeholderCard}>
                <p className={styles.placeholderText}>Henüz kayıtlı mağaza yok.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mağaza Adı</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Durum</th>
                    <th>Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTenants.map((t) => (
                    <tr key={t.id}>
                      <td className={styles.tenantName}>{t.name}</td>
                      <td className={styles.slugText}>{t.slug}</td>
                      <td>{t.plan}</td>
                      <td>
                        <span className={`${styles.badge} ${getBadgeClass(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={styles.dateTxt}>{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!isLoading && !error && !stats && (
        <div className={styles.placeholderCard}>
          <p className={styles.placeholderText}>Veri bulunamadı.</p>
        </div>
      )}
    </div>
  );
};
