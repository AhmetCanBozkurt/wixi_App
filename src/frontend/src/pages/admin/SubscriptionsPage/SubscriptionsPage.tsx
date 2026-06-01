import { useState, useEffect, useCallback } from 'react';
import { FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { Input, Select, Button } from '../../../shared/ui';
import s from './SubscriptionsPage.module.css';

interface SubscriptionItem {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  ownerEmail: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  billingInterval: string;
  createdAt: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  pastDue: number;
  cancelled: number;
}

interface SubscriptionsResponse {
  items: SubscriptionItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: SubscriptionStats;
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { label: 'Tum Durumlar', value: '' },
  { label: 'Trial', value: 'Trial' },
  { label: 'Active', value: 'Active' },
  { label: 'PastDue', value: 'PastDue' },
  { label: 'Cancelled', value: 'Cancelled' },
];

function statusClass(status: string): string {
  switch (status) {
    case 'Active':    return s.badgeActive;
    case 'Trial':     return s.badgeTrial;
    case 'PastDue':   return s.badgePastDue;
    case 'Cancelled': return s.badgeCancelled;
    default:          return s.badgeDefault;
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR');
}

export function SubscriptionsPage() {
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<SubscriptionsResponse>('admin/subscriptions', {
        params: { page, pageSize: PAGE_SIZE, status: status || undefined, search: search || undefined },
      });
      setData(res.data);
    } catch {
      toast.error('Abonelikler yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.titleRow}>
          <FaCreditCard className={s.titleIcon} />
          <div>
            <h1 className={s.title}>Abonelik Yonetimi</h1>
            <p className={s.subtitle}>Tum tenant aboneliklerini goruntule ve filtrele.</p>
          </div>
        </div>
      </div>

      {data && (
        <div className={s.statGrid}>
          <div className={`${s.statCard} ${s.statBlue}`}>
            <span className={s.statLabel}>Toplam</span>
            <span className={s.statValue}>{data.stats.total}</span>
          </div>
          <div className={`${s.statCard} ${s.statGreen}`}>
            <span className={s.statLabel}>Aktif</span>
            <span className={s.statValue}>{data.stats.active}</span>
          </div>
          <div className={`${s.statCard} ${s.statOrange}`}>
            <span className={s.statLabel}>Trial</span>
            <span className={s.statValue}>{data.stats.trial}</span>
          </div>
          <div className={`${s.statCard} ${s.statRed}`}>
            <span className={s.statLabel}>PastDue</span>
            <span className={s.statValue}>{data.stats.pastDue}</span>
          </div>
          <div className={`${s.statCard} ${s.statGray}`}>
            <span className={s.statLabel}>Iptal</span>
            <span className={s.statValue}>{data.stats.cancelled}</span>
          </div>
        </div>
      )}

      <div className={s.filters}>
        <Input
          placeholder="Magaza adi, slug veya e-posta..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={val => { setStatus(String(val)); setPage(1); }}
        />
        <Button variant="ghost" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
          Temizle
        </Button>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Magaza Adi</th>
              <th>E-posta</th>
              <th>Plan</th>
              <th>Durum</th>
              <th>Bitis Tarihi</th>
              <th>Kayit Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.center}>Yukleniyor...</td></tr>
            ) : !data || data.items.length === 0 ? (
              <tr><td colSpan={6} className={s.center}>Kayit bulunamadi.</td></tr>
            ) : data.items.map(item => (
              <tr key={item.tenantId}>
                <td>
                  <div className={s.nameCell}>
                    <span className={s.nameMain}>{item.tenantName}</span>
                    <span className={s.nameSlug}>{item.tenantSlug}</span>
                  </div>
                </td>
                <td>{item.ownerEmail}</td>
                <td>{item.planName}</td>
                <td>
                  <span className={`${s.badge} ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>{fmtDate(item.currentPeriodEnd)}</td>
                <td>{fmtDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className={s.pagination}>
          <Button
            variant="ghost"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Onceki
          </Button>
          <span className={s.pageInfo}>{page} / {totalPages}</span>
          <Button
            variant="ghost"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
