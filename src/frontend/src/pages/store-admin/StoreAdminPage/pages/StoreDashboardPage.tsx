import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaBoxOpen, FaCheckCircle, FaTags, FaTrademark,
  FaShoppingCart, FaUsers, FaExclamationTriangle,
  FaChartLine, FaCog, FaPercent, FaStar, FaBolt,
  FaImage, FaAddressBook,
} from 'react-icons/fa';
import { apiClient } from '../../../../shared/api/axiosConfig';
import styles from './StoreDashboardPage.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  productCount: number;
  activeProductCount: number;
  categoryCount: number;
  brandCount: number;
  customerCount: number;
  lowStockCount: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  pendingOrders: number;
  topProducts: TopProduct[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString('tr-TR');
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ h = 120, br = 12 }: { h?: number; br?: number }) => (
  <div className={styles.skeleton} style={{ height: h, borderRadius: br }} />
);

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  accent: string;
  value: number;
  label: string;
  sub?: string;
  warn?: boolean;
}

const KpiCard = ({ icon, accent, value, label, sub, warn }: KpiCardProps) => (
  <div
    className={`${styles.kpiCard} ${warn && value > 0 ? styles.kpiWarn : ''}`}
    style={{ '--kpi-accent': warn && value > 0 ? '#f59e0b' : accent } as React.CSSProperties}
  >
    <div className={styles.kpiTop}>
      <div
        className={styles.kpiIcon}
        style={{
          background: `${warn && value > 0 ? '#f59e0b' : accent}1a`,
          color: warn && value > 0 ? '#f59e0b' : accent,
        }}
      >
        {icon}
      </div>
      {warn && value > 0 && (
        <span className={styles.warnBadge}>{value} uyarı</span>
      )}
    </div>
    <span className={styles.kpiValue}>{fmtInt(value)}</span>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export const StoreDashboardPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();

  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, overviewRes] = await Promise.allSettled([
          apiClient.get<DashboardStats>('/store-admin/dashboard/stats'),
          apiClient.get<AnalyticsOverview>('/store-admin/analytics/overview'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        else setError('İstatistikler yüklenemedi.');
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [tenantSlug]);

  const base = `/tenant/${tenantSlug ?? ''}`;

  return (
    <div className={styles.page}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroPill}>
            <span className={styles.heroPillDot} />
            Mağaza Aktif
          </div>
          <h1 className={styles.heroTitle}>Gösterge Paneli</h1>
          <p className={styles.heroSub}>{getTodayLabel()}</p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>
              {isLoading ? '—' : fmtInt(overview?.totalOrders ?? 0)}
            </span>
            <span className={styles.heroStatLabel}>Toplam Sipariş</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>
              {isLoading ? '—' : fmtInt(overview?.pendingOrders ?? 0)}
            </span>
            <span className={styles.heroStatLabel}>Bekleyen</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>
              {isLoading ? '—' : fmtInt(stats?.customerCount ?? 0)}
            </span>
            <span className={styles.heroStatLabel}>Müşteri</span>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={140} />)
        ) : (
          <>
            <KpiCard icon={<FaBoxOpen />}      accent="#6366f1" value={stats?.productCount ?? 0}       label="Toplam Ürün"        sub={`${stats?.activeProductCount ?? 0} aktif`} />
            <KpiCard icon={<FaCheckCircle />}  accent="#10b981" value={stats?.activeProductCount ?? 0}  label="Aktif Ürün"         sub="Yayında" />
            <KpiCard icon={<FaTags />}         accent="#3b82f6" value={stats?.categoryCount ?? 0}       label="Kategori"           sub="Aktif kategoriler" />
            <KpiCard icon={<FaTrademark />}    accent="#8b5cf6" value={stats?.brandCount ?? 0}          label="Marka"              sub="Kayıtlı markalar" />
          </>
        )}
      </div>

      {/* ── Revenue + Sipariş + Düşük Stok ───────────────────── */}
      <div className={styles.revenueRow}>
        {/* Revenue hero */}
        <div className={styles.revenueHero}>
          <div className={styles.revenueBadge}>
            <FaChartLine />
            Son 30 Gün Cirosu
          </div>
          {isLoading ? (
            <Skeleton h={56} br={8} />
          ) : (
            <div className={styles.revenueAmountBig}>
              <span className={styles.revenueCurrency}>₺</span>
              {fmt(overview?.totalRevenue ?? 0)}
            </div>
          )}
          <div className={styles.revenueStats}>
            <div className={styles.revenueStat}>
              <span className={styles.revenueStatNum}>{fmtInt(overview?.totalOrders ?? 0)}</span>
              <span className={styles.revenueStatLabel}>Sipariş</span>
            </div>
            <div className={styles.revenueStatDivider} />
            <div className={styles.revenueStat}>
              <span className={styles.revenueStatNum}>₺{fmt(overview?.avgOrderValue ?? 0)}</span>
              <span className={styles.revenueStatLabel}>Ortalama Sepet</span>
            </div>
          </div>
        </div>

        {/* Müşteri + bekleyen */}
        <div className={styles.infoCard}>
          <p className={styles.infoTitle}>Sipariş Durumu</p>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem} style={{ '--info-color': '#f59e0b' } as React.CSSProperties}>
              <span className={styles.infoNum}>{isLoading ? '—' : fmtInt(overview?.pendingOrders ?? 0)}</span>
              <span className={styles.infoLabel}>Bekleyen Sipariş</span>
            </div>
            <div className={styles.infoItem} style={{ '--info-color': '#10b981' } as React.CSSProperties}>
              <span className={styles.infoNum}>{isLoading ? '—' : fmtInt(overview?.totalCustomers ?? 0)}</span>
              <span className={styles.infoLabel}>Toplam Müşteri</span>
            </div>
            <div className={styles.infoItem} style={{ '--info-color': '#6366f1' } as React.CSSProperties}>
              <span className={styles.infoNum}>{isLoading ? '—' : fmtInt(stats?.productCount ?? 0)}</span>
              <span className={styles.infoLabel}>Toplam Ürün</span>
            </div>
            <div className={styles.infoItem} style={{ '--info-color': '#3b82f6' } as React.CSSProperties}>
              <span className={styles.infoNum}>{isLoading ? '—' : fmtInt(stats?.categoryCount ?? 0)}</span>
              <span className={styles.infoLabel}>Kategori</span>
            </div>
          </div>
          <button className={styles.infoLink} onClick={() => navigate(`${base}/orders`)} type="button">
            Siparişlere git →
          </button>
        </div>

        {/* Düşük stok */}
        <div className={`${styles.stockCard} ${(stats?.lowStockCount ?? 0) > 0 ? styles.stockWarn : styles.stockOk}`}>
          <div className={styles.stockTop}>
            <div className={styles.stockIcon}>
              {(stats?.lowStockCount ?? 0) > 0 ? <FaExclamationTriangle /> : <FaCheckCircle />}
            </div>
            <p className={styles.stockTitle}>Stok Durumu</p>
          </div>
          {isLoading ? (
            <Skeleton h={48} br={8} />
          ) : (
            <>
              <span className={styles.stockNum}>{stats?.lowStockCount ?? 0}</span>
              <p className={styles.stockDesc}>
                {(stats?.lowStockCount ?? 0) > 0
                  ? 'ürün düşük stok eşiğinin altında'
                  : 'Tüm ürünlerin stoğu yeterli'}
              </p>
            </>
          )}
          {(stats?.lowStockCount ?? 0) > 0 && (
            <button className={styles.stockLink} onClick={() => navigate(`${base}/stock`)} type="button">
              Stok yönetimine git →
            </button>
          )}
        </div>
      </div>

      {/* ── Top Ürünler + Quick Actions ───────────────────────── */}
      <div className={styles.midRow}>
        {/* Top products */}
        <div className={styles.topCard}>
          <div className={styles.topHeader}>
            <p className={styles.panelTitle}>
              <FaStar style={{ color: '#f59e0b' }} />
              En Çok Satan Ürünler
            </p>
            <span className={styles.topPeriod}>Son 30 gün</span>
          </div>
          {isLoading ? (
            <div className={styles.topList}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={44} br={6} />)}
            </div>
          ) : !overview || overview.topProducts.length === 0 ? (
            <p className={styles.empty}>Henüz satış verisi yok.</p>
          ) : (
            <div className={styles.topList}>
              {overview.topProducts.map((p, i) => (
                <div key={p.productId} className={styles.topRow}>
                  <span className={styles.topRank}>{i + 1}</span>
                  <div className={styles.topInfo}>
                    <span className={styles.topName}>{p.productName}</span>
                    <span className={styles.topMeta}>{fmtInt(p.totalSold)} adet satıldı</span>
                  </div>
                  <span className={styles.topRevenue}>₺{fmt(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}
          <button className={styles.topLink} onClick={() => navigate(`${base}/analytics`)} type="button">
            Tüm analizleri gör →
          </button>
        </div>

        {/* Quick actions */}
        <div className={styles.quickCard}>
          <p className={styles.panelTitle}>
            <FaBolt style={{ color: '#f59e0b' }} />
            Hızlı Erişim
          </p>
          <div className={styles.quickList}>
            <QuickAction icon={<FaShoppingCart />}  accent="#6366f1" label="Siparişler"   desc="Sipariş takibi & durumu" onClick={() => navigate(`${base}/orders`)} />
            <QuickAction icon={<FaBoxOpen />}        accent="#10b981" label="Ürünler"      desc="Ürün & varyant yönetimi" onClick={() => navigate(`${base}/products`)} />
            <QuickAction icon={<FaUsers />}          accent="#3b82f6" label="Müşteriler"   desc="Müşteri hesapları"       onClick={() => navigate(`${base}/customers`)} />
            <QuickAction icon={<FaPercent />}        accent="#f59e0b" label="İndirimler"   desc="Kupon & kampanyalar"     onClick={() => navigate(`${base}/discounts`)} />
            <QuickAction icon={<FaImage />}          accent="#8b5cf6" label="Tema & Görsel" desc="Tasarım düzenleyici"    onClick={() => navigate(`${base}/theme-editor`)} />
            <QuickAction icon={<FaAddressBook />}    accent="#ec4899" label="Formlar"      desc="İletişim talepleri"      onClick={() => navigate(`${base}/contact-submissions`)} />
            <QuickAction icon={<FaChartLine />}      accent="#0891b2" label="Analitik"     desc="Satış & trafik raporu"   onClick={() => navigate(`${base}/analytics`)} />
            <QuickAction icon={<FaCog />}            accent="#64748b" label="Ayarlar"      desc="Mağaza yapılandırması"   onClick={() => navigate(`${base}/settings`)} />
          </div>
        </div>
      </div>

    </div>
  );
};
