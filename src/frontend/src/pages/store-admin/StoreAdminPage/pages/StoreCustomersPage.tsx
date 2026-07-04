import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Select } from '../../../../shared/ui/Select/Select';
import { apiClient } from '../../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

export interface CustomerListDto extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  rfmSegment?: string;
  ltvAmount: number;
  totalOrders: number;
  lastOrderDate?: string;
  isBlacklisted: boolean;
}

export const SEGMENT_LABELS: Record<string, { label: string; color: string }> = {
  Loyal: { label: 'Sadık', color: '#10b981' },
  Active: { label: 'Aktif', color: '#3b82f6' },
  AtRisk: { label: 'Risk Altında', color: '#f59e0b' },
  Sleeping: { label: 'Uyuyan', color: '#94a3b8' },
  NewCustomer: { label: 'Yeni Müşteri', color: '#8b5cf6' },
  LostChampion: { label: 'Kaybedilen', color: '#ef4444' },
};

const SEGMENT_OPTIONS = [
  { label: '— Tüm Segmentler —', value: '' },
  ...Object.entries(SEGMENT_LABELS).map(([value, v]) => ({ label: v.label, value })),
];

export const StoreCustomersPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<CustomerListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [segment, setSegment] = useState<string>('');

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '100' });
      if (segment) params.set('segment', segment);
      const res = await apiClient.get<{ items: CustomerListDto[] }>(`/store-admin/customers?${params}`);
      setItems(res.data.items ?? []);
    } catch {
      toast.error('Müşteriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [segment]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const columns: ColumnConfig<CustomerListDto>[] = useMemo(() => [
    {
      field: 'firstName',
      title: 'Müşteri',
      width: 220,
      template: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {row.firstName} {row.lastName}
            {row.isBlacklisted && (
              <span style={{ marginLeft: 6, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 700 }}>
                Kara Liste
              </span>
            )}
          </span>
          <span className={s.muted} style={{ fontSize: '0.78rem' }}>{row.email}</span>
        </div>
      ),
    },
    {
      field: 'phoneNumber',
      title: 'Telefon',
      width: 130,
      template: (row) => row.phoneNumber ? <span>{row.phoneNumber}</span> : <span className={s.muted}>—</span>,
    },
    {
      field: 'rfmSegment',
      title: 'Segment',
      width: 130,
      template: (row) => {
        const seg = row.rfmSegment ? SEGMENT_LABELS[row.rfmSegment] : undefined;
        return seg ? (
          <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, background: `${seg.color}1a`, color: seg.color, border: `1px solid ${seg.color}33`, fontWeight: 600 }}>
            {seg.label}
          </span>
        ) : <span className={s.muted}>—</span>;
      },
    },
    {
      field: 'totalOrders',
      title: 'Sipariş',
      width: 80,
      template: (row) => <span>{row.totalOrders}</span>,
    },
    {
      field: 'ltvAmount',
      title: 'LTV',
      width: 110,
      template: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.ltvAmount > 0 ? `${row.ltvAmount.toLocaleString('tr-TR')} ₺` : '—'}
        </span>
      ),
    },
    {
      field: 'isActive',
      title: 'Durum',
      width: 90,
      template: (row) => (
        <span className={row.isActive ? s.badgeActive : s.badgeInactive}>
          {row.isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      title: 'Kayıt',
      width: 110,
      template: (row) => <span className={s.muted}>{new Date(row.createdAt).toLocaleDateString('tr-TR')}</span>,
    },
  ], []);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaUsers className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Müşteriler</h2>
            <p className={s.pageSubtitle}>CRM müşteri listesi — detay için satıra tıklayın</p>
          </div>
        </div>
        <div style={{ minWidth: 220 }}>
          <Select
            options={SEGMENT_OPTIONS}
            value={segment}
            onChange={(v) => setSegment(String(v))}
            placeholder="Segment filtresi"
          />
        </div>
      </div>

      <AdvancedDataTable<CustomerListDto>
        dataSource={isLoading ? [] : items}
        columns={columns}
        pageable={{ pageSize: 20 }}
        toolbar={['search', 'excel']}
        filterable
        onRowClick={(row) => navigate(`/tenant/${tenantSlug}/customers/${row.id}`)}
      />
    </div>
  );
};
