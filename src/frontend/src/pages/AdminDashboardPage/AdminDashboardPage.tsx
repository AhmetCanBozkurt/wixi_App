import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaStore, FaCheckCircle, FaCalendarPlus, FaUsers,
  FaExclamationTriangle, FaShieldAlt, FaChartLine,
  FaCog, FaLanguage, FaBuilding, FaEnvelope, FaKey,
  FaBolt,
} from 'react-icons/fa';
import apiClient from '../../shared/api/axiosConfig';
import styles from './AdminDashboardPage.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface AuditStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  todayCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getPlanColor(code: string): string {
  if (code === 'free')     return '#6b7280';
  if (code === 'starter')  return '#3b82f6';
  if (code === 'pro')      return '#8b5cf6';
  if (code === 'business') return '#f59e0b';
  return '#6366f1';
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  trial:     { label: 'Trial',          cls: 'trial' },
  active:    { label: 'Aktif',          cls: 'active' },
  cancelled: { label: 'İptal',          cls: 'cancelled' },
  pastdue:   { label: 'Vadesi Geçmiş',  cls: 'pastDue' },
  '—':       { label: '—',              cls: 'default' },
};

function getBadgeInfo(status: string) {
  return STATUS_MAP[status.toLowerCase()] ?? { label: status, cls: 'default' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  accent: string;
  value: number | string;
  label: string;
  sub?: string;
}

const KpiCard = ({ icon, accent, value, label, sub }: KpiCardProps) => (
  <div className={styles.kpiCard} style={{ '--kpi-accent': accent } as React.CSSProperties}>
    <div className={styles.kpiTop}>
      <div className={styles.kpiIcon} style={{ background: `${accent}1a`, color: accent }}>
        {icon}
      </div>
    </div>
    <span className={styles.kpiValue}>{typeof value === 'number' ? value.toLocaleString('tr-TR') : value}</span>
    <span className={styles.kpiLabel}>{label}</span>
    {sub && <span className={styles.kpiSub}>{sub}</span>}
  </div>
);

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  accent: string;
  onClick: () => void;
}

const QuickAction = ({ icon, label, desc, accent, onClick }: QuickActionProps) => (
  <button className={styles.quickAction} onClick={onClick} type="button">
    <div className={styles.qaIcon} style={{ background: `${accent}1a`, color: accent }}>{icon}</div>
    <div className={styles.qaText}>
      <span className={styles.qaLabel}>{label}</span>
      <span className={styles.qaDesc}>{desc}</span>
    </div>
    <span className={styles.qaArrow}>→</span>
  </button>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ h = 120, br = 12 }: { h?: number; br?: number }) => (
  <div className={styles.skeleton} style={{ height: h, borderRadius: br }} />
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [audit, setAudit]           = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, auditRes] = await Promise.allSettled([
          apiClient.get<DashboardStats>('/admin/dashboard/stats'),
          apiClient.get<AuditStats>('/admin/logs/audit/stats'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        else setError('Dashboard istatistikleri yüklenemedi.');
        if (auditRes.status === 'fulfilled') setAudit(auditRes.value.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const totalSubs = stats
    ? Object.values(stats.subscriptionsByStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className={styles.page}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroPill}>
            <span className={styles.heroPillDot} />
            Platform Aktif
          </div>
          <h1 className={styles.heroTitle}>Platform Dashboard</h1>
          <p className={styles.heroSub}>{getTodayLabel()}</p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{isLoading ? '—' : (stats?.activeTenants ?? 0)}</span>
            <span className={styles.heroStatLabel}>Aktif Mağaza</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{isLoading ? '—' : (audit?.todayCount ?? 0)}</span>
            <span className={styles.heroStatLabel}>Bugünkü İşlem</span>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={140} />)
        ) : stats ? (
          <>
            <KpiCard icon={<FaBuilding />} accent="#6366f1" value={stats.totalTenants}        label="Toplam Mağaza"    sub={`${stats.activeTenants} aktif`} />
            <KpiCard icon={<FaCheckCircle />} accent="#10b981" value={stats.activeTenants}     label="Aktif Mağaza"    sub="Şu an çalışıyor" />
            <KpiCard icon={<FaCalendarPlus />} accent="#f59e0b" value={stats.newTenantsThisMonth} label="Bu Ay Kayıt"  sub="Yeni mağaza" />
            <KpiCard icon={<FaUsers />} accent="#8b5cf6" value={stats.totalUsers}              label="Toplam Kullanıcı" sub="Tüm hesaplar" />
          </>
        ) : null}
      </div>

      {/* ── Revenue + Abonelik Özeti ─────────────────────────────── */}
      <div className={styles.revenueRow}>
        {/* Total revenue */}
        <div className={styles.revenueHero}>
          <div className={styles.revenueBadge}>
            <FaChartLine />
            Toplam Ciro
          </div>
          {isLoading ? (
            <Skeleton h={56} br={8} />
          ) : (
            <div className={styles.revenueAmountBig}>
              <span className={styles.revenueCurrency}>₺</span>
              {stats ? formatCurrency(stats.totalRevenue) : '—'}
            </div>
          )}
          <div className={styles.revenueMonthRow}>
            <span className={styles.revenueMonthLabel}>Bu ay</span>
            <span className={styles.revenueMonthAmt}>
              ₺{stats ? formatCurrency(stats.revenueThisMonth) : '—'}
            </span>
          </div>
        </div>

        {/* Subscription breakdown */}
        <div className={styles.subCard}>
          <p className={styles.subTitle}>Abonelik Durumu</p>
          <div className={styles.subList}>
            {[
              { key: 'trial',     label: 'Trial',          color: '#f97316', count: stats?.subscriptionsByStatus.trial ?? 0 },
              { key: 'active',    label: 'Aktif',          color: '#10b981', count: stats?.subscriptionsByStatus.active ?? 0 },
              { key: 'cancelled', label: 'İptal',          color: '#ef4444', count: stats?.subscriptionsByStatus.cancelled ?? 0 },
              { key: 'pastDue',   label: 'Vadesi Geçmiş',  color: '#f59e0b', count: stats?.subscriptionsByStatus.pastDue ?? 0 },
            ].map(item => {
              const pct = totalSubs > 0 ? Math.round((item.count / totalSubs) * 100) : 0;
              return (
                <div key={item.key} className={styles.subRow}>
                  <div className={styles.subRowTop}>
                    <div className={styles.subRowLeft}>
                      <span className={styles.subDot} style={{ background: item.color }} />
                      <span className={styles.subLabel}>{item.label}</span>
                    </div>
                    <span className={styles.subCount}>{isLoading ? '—' : item.count}</span>
                  </div>
                  <div className={styles.subBar}>
                    <div className={styles.subBarFill} style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System health */}
        <div className={styles.healthCard}>
          <p className={styles.subTitle}>
            <FaShieldAlt style={{ color: '#6366f1' }} />
            Sistem Sağlığı
          </p>
          <div className={styles.healthGrid}>
            <div className={styles.healthItem}>
              <span className={styles.healthNum} style={{ color: '#10b981' }}>{isLoading ? '—' : (audit?.info ?? 0)}</span>
              <span className={styles.healthItemLabel}>Bilgi</span>
            </div>
            <div className={styles.healthItem}>
              <span className={styles.healthNum} style={{ color: '#f59e0b' }}>{isLoading ? '—' : (audit?.warnings ?? 0)}</span>
              <span className={styles.healthItemLabel}>Uyarı</span>
            </div>
            <div className={styles.healthItem}>
              <span className={styles.healthNum} style={{ color: '#ef4444' }}>{isLoading ? '—' : (audit?.errors ?? 0)}</span>
              <span className={styles.healthItemLabel}>Hata</span>
            </div>
            <div className={styles.healthItem}>
              <span className={styles.healthNum} style={{ color: '#6366f1' }}>{isLoading ? '—' : (audit?.total ?? 0)}</span>
              <span className={styles.healthItemLabel}>Toplam</span>
            </div>
          </div>
          <button className={styles.healthLink} onClick={() => navigate('/admin/audit')} type="button">
            Audit loglarını görüntüle →
          </button>
        </div>
      </div>

      {/* ── Plan Dağılımı + Quick Actions ───────────────────────── */}
      <div className={styles.midRow}>
        {/* Plan distribution */}
        <div className={styles.planCard}>
          <p className={styles.panelTitle}>Plan Dağılımı</p>
          {isLoading ? (
            <div className={styles.planList}>
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={44} br={6} />)}
            </div>
          ) : !stats || stats.planDistribution.length === 0 ? (
            <p className={styles.empty}>Henüz abonelik verisi yok.</p>
          ) : (
            <div className={styles.planList}>
              {stats.planDistribution.map(plan => {
                const color = getPlanColor(plan.code);
                return (
                  <div key={plan.code} className={styles.planRow}>
                    <div className={styles.planMeta}>
                      <div className={styles.planLeft}>
                        <span className={styles.planDot} style={{ background: color }} />
                        <span className={styles.planName}>{plan.planName}</span>
                      </div>
                      <div className={styles.planRight}>
                        <span className={styles.planCount}>{plan.count}</span>
                        <span className={styles.planPct}>%{plan.percentage}</span>
                      </div>
                    </div>
                    <div className={styles.planBar}>
                      <div
                        className={styles.planFill}
                        style={{ width: `${plan.percentage}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className={styles.quickCard}>
          <p className={styles.panelTitle}>
            <FaBolt style={{ color: '#f59e0b' }} />
            Hızlı Erişim
          </p>
          <div className={styles.quickList}>
            <QuickAction icon={<FaStore />}    accent="#6366f1" label="Mağazalar"   desc="Tenant yönetimi"   onClick={() => navigate('/admin/ecommerce/tenants')} />
            <QuickAction icon={<FaUsers />}    accent="#10b981" label="Kullanıcılar" desc="Hesap yönetimi"   onClick={() => navigate('/admin/users')} />
            <QuickAction icon={<FaEnvelope />} accent="#f97316" label="Mail Sistemi"  desc="SMTP & şablonlar" onClick={() => navigate('/admin/mailing')} />
            <QuickAction icon={<FaLanguage />} accent="#8b5cf6" label="Diller"        desc="Lokalizasyon"     onClick={() => navigate('/admin/languages')} />
            <QuickAction icon={<FaKey />}      accent="#ef4444" label="Roller"        desc="Yetki yönetimi"   onClick={() => navigate('/admin/roles')} />
            <QuickAction icon={<FaCog />}      accent="#64748b" label="Modüller"      desc="Sistem modülleri" onClick={() => navigate('/admin/modules')} />
          </div>
        </div>
      </div>

      {/* ── Recent Tenants ───────────────────────────────────────── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.tableTitle}>Son Kayıt Olan Mağazalar</p>
            <p className={styles.tableSub}>En son 5 kayıt</p>
          </div>
          <button
            className={styles.tableLink}
            onClick={() => navigate('/admin/ecommerce/tenants')}
            type="button"
          >
            Tümünü Gör →
          </button>
        </div>

        {isLoading ? (
          <div className={styles.tableBody}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={52} br={6} />)}
          </div>
        ) : !stats || stats.recentTenants.length === 0 ? (
          <div className={styles.tableBody}>
            <p className={styles.empty}>Henüz kayıtlı mağaza yok.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mağaza</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTenants.map(t => {
                  const badge = getBadgeInfo(t.status);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className={styles.tenantCell}>
                          <div className={styles.tenantAvatar}>{getInitials(t.name)}</div>
                          <span className={styles.tenantName}>{t.name}</span>
                        </div>
                      </td>
                      <td><code className={styles.slug}>{t.slug}</code></td>
                      <td><span className={styles.planPill}>{t.plan}</span></td>
                      <td>
                        <span className={`${styles.badge} ${styles[badge.cls]}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{formatDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
