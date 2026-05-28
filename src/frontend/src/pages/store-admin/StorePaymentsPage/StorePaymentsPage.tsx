import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { Select, Button } from '../../../shared/ui';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import ps from './StorePaymentsPage.module.css';

interface PaymentLogDto {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface PaymentLogsResponse {
  items: PaymentLogDto[];
  total: number;
  totalSuccess: number;
  totalFailed: number;
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { label: 'Tumu', value: '' },
  { label: 'Basarili', value: 'Success' },
  { label: 'Basarisiz', value: 'Failed' },
  { label: 'Bekliyor', value: 'Initiated' },
  { label: 'Iptal', value: 'Cancelled' },
];

function statusClass(status: string): string {
  switch (status) {
    case 'Success':   return ps.badgeSuccess;
    case 'Failed':    return ps.badgeFailed;
    case 'Initiated': return ps.badgeInitiated;
    case 'Cancelled': return ps.badgeCancelled;
    default:          return ps.badgeDefault;
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function fmtAmount(amount: number, currency: string) {
  return amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ' + currency;
}

export function StorePaymentsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [data, setData] = useState<PaymentLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PaymentLogsResponse>('store-admin/payments', {
        headers: { 'X-Tenant-Slug': tenantSlug },
        params: {
          page,
          pageSize: PAGE_SIZE,
          statusFilter: statusFilter || undefined,
        },
      });
      setData(res.data);
    } catch {
      toast.error('Odeme gecmisi yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaCreditCard className={s.titleIcon} />
          <div>
            <h1 className={s.pageTitle}>Odeme Gecmisi</h1>
            <p className={s.pageSubtitle}>Magaza odeme log kayitlari.</p>
          </div>
        </div>
      </div>

      {data && (
        <div className={ps.statGrid}>
          <div className={ps.statCard}>
            <span className={ps.statLabel}>Toplam</span>
            <span className={ps.statValue}>{data.total}</span>
          </div>
          <div className={`${ps.statCard} ${ps.statGreen}`}>
            <span className={ps.statLabel}>Basarili</span>
            <span className={ps.statValue}>{data.totalSuccess}</span>
          </div>
          <div className={`${ps.statCard} ${ps.statRed}`}>
            <span className={ps.statLabel}>Basarisiz</span>
            <span className={ps.statValue}>{data.totalFailed}</span>
          </div>
        </div>
      )}

      <div className={ps.filters}>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={val => { setStatusFilter(String(val)); setPage(1); }}
          placeholder="Durum filtrele"
        />
        <Button variant="ghost" onClick={() => { setStatusFilter(''); setPage(1); }}>
          Temizle
        </Button>
      </div>

      <div className={ps.tableWrap}>
        <table className={ps.table}>
          <thead>
            <tr>
              <th>Siparis No</th>
              <th>Musteri</th>
              <th>Tutar</th>
              <th>Gateway</th>
              <th>Durum</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={ps.center}>Yukleniyor...</td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className={ps.center}>Odeme logu bulunamadi.</td>
              </tr>
            ) : data.items.map(item => (
              <tr key={item.id}>
                <td className={ps.mono}>{item.orderNumber}</td>
                <td>{item.customerName}</td>
                <td className={ps.mono}>{fmtAmount(item.amount, item.currency)}</td>
                <td>{item.gateway}</td>
                <td>
                  <span className={`${ps.badge} ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className={ps.muted}>{fmtDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className={ps.pagination}>
          <Button
            variant="ghost"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Onceki
          </Button>
          <span className={ps.pageInfo}>{page} / {totalPages}</span>
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
