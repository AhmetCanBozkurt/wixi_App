import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaChartBar } from 'react-icons/fa';

import { apiClient } from '../../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import cs from './StoreAnalyticsPage.module.css';

interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

interface Overview {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  pendingOrders: number;
  topProducts: TopProduct[];
}

interface DailyStat {
  date: string;
  orders: number;
  revenue: number;
}

function fmt(n: number) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StoreAnalyticsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { 'X-Tenant-Slug': tenantSlug };
      const [ov, dv] = await Promise.all([
        apiClient.get('/store-admin/analytics/overview', { headers }),
        apiClient.get('/store-admin/analytics/orders-by-day', { headers }),
      ]);
      setOverview(ov.data);
      setDaily(dv.data);
    } catch {
      toast.error('Analitik veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  const maxRevenue = daily.reduce((m, d) => Math.max(m, d.revenue), 1);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaChartBar className={s.titleIcon} />
          <div>
            <h1 className={s.pageTitle}>Analitik</h1>
            <p className={s.pageSubtitle}>Son 30 günlük sipariş ve gelir özeti.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className={s.muted}>Yükleniyor…</p>
      ) : overview && (
        <>
          <div className={cs.statCards}>
            <div className={cs.card}>
              <span className={cs.cardLabel}>Toplam Gelir</span>
              <span className={cs.cardValue}>₺{fmt(overview.totalRevenue)}</span>
            </div>
            <div className={cs.card}>
              <span className={cs.cardLabel}>Sipariş Sayısı</span>
              <span className={cs.cardValue}>{overview.totalOrders}</span>
            </div>
            <div className={cs.card}>
              <span className={cs.cardLabel}>Ortalama Sipariş</span>
              <span className={cs.cardValue}>₺{fmt(overview.avgOrderValue)}</span>
            </div>
            <div className={cs.card}>
              <span className={cs.cardLabel}>Toplam Müşteri</span>
              <span className={cs.cardValue}>{overview.totalCustomers}</span>
            </div>
            <div className={cs.card}>
              <span className={cs.cardLabel}>Bekleyen Sipariş</span>
              <span className={cs.cardValue}>{overview.pendingOrders}</span>
            </div>
          </div>

          <div className={cs.chartSection}>
            <h3 className={cs.sectionTitle}>Son 30 Gün — Günlük Gelir</h3>
            <div className={cs.barChart}>
              {daily.map(d => (
                <div key={d.date} className={cs.barCol} title={`${d.date}: ₺${fmt(d.revenue)} (${d.orders} sipariş)`}>
                  <div
                    className={cs.bar}
                    style={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }}
                  />
                  <span className={cs.barLabel}>{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          {overview.topProducts.length > 0 && (
            <div className={cs.topSection}>
              <h3 className={cs.sectionTitle}>En Çok Satan Ürünler</h3>
              <table className={cs.topTable}>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topProducts.map(p => (
                    <tr key={p.productId}>
                      <td>{p.productName}</td>
                      <td>{p.totalSold}</td>
                      <td>₺{fmt(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
