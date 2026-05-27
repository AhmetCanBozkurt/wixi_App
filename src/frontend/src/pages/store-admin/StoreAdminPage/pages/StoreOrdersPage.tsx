import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaShoppingCart, FaTruck, FaCheckCircle, FaClock,
  FaTimesCircle, FaUndo, FaBoxOpen, FaSpinner,
} from 'react-icons/fa';
import { AdvancedDataTable } from '../../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Button } from '../../../../shared/ui/Button/Button';
import { Select } from '../../../../shared/ui/Select/Select';
import { apiClient } from '../../../../shared/api/axiosConfig';
import { toast } from 'react-hot-toast';
import s from './storeAdmin.shared.module.css';

const STATUS_OPTIONS = [
  { label: '— Durum Değiştir —', value: '' },
  { label: 'Bekliyor',       value: 'Pending' },
  { label: 'Ödendi',         value: 'Paid' },
  { label: 'Hazırlanıyor',   value: 'Processing' },
  { label: 'Kargoda',        value: 'Shipped' },
  { label: 'Teslim Edildi',  value: 'Delivered' },
  { label: 'İptal',          value: 'Cancelled' },
  { label: 'İade',           value: 'Refunded' },
];

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  status: string;
  shippingAddress: string;
  billingAddress: string;
  trackingNumber?: string;
  shippingProvider?: string;
  createdAt: string;
  items: { id: string; productName: string; variantName?: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  Pending:    { label: 'Bekliyor',      color: '#6b7280', icon: FaClock },
  Paid:       { label: 'Ödendi',        color: '#3b82f6', icon: FaCheckCircle },
  Processing: { label: 'Hazırlanıyor',  color: '#8b5cf6', icon: FaBoxOpen },
  Shipped:    { label: 'Kargoda',       color: '#f59e0b', icon: FaTruck },
  Delivered:  { label: 'Teslim Edildi', color: '#10b981', icon: FaCheckCircle },
  Cancelled:  { label: 'İptal',         color: '#ef4444', icon: FaTimesCircle },
  Refunded:   { label: 'İade',          color: '#ec4899', icon: FaUndo },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: '#6b7280', icon: FaClock };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40`,
    }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

export const StoreOrdersPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const openDetail = useCallback(async (row: Record<string, unknown>) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setNewStatus('');
    setTrackingNumber('');
    try {
      const res = await apiClient.get<OrderDetail>(`/store-admin/orders/${row.id as string}`);
      setDetailOrder(res.data);
    } catch {
      toast.error('Sipariş detayı yüklenemedi.');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSaveStatus = useCallback(async () => {
    if (!detailOrder || !newStatus) return;
    setSavingStatus(true);
    try {
      await apiClient.patch(`/store-admin/orders/${detailOrder.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || null,
      });
      toast.success('Sipariş durumu güncellendi.');
      setDetailOrder(prev => prev ? { ...prev, status: newStatus, trackingNumber: trackingNumber || prev.trackingNumber } : null);
      setNewStatus('');
      setTableKey(k => k + 1); // tabloyu yenile
    } catch {
      toast.error('Güncelleme başarısız oldu.');
    } finally {
      setSavingStatus(false);
    }
  }, [detailOrder, newStatus, trackingNumber]);

  const columns: ColumnConfig<Record<string, unknown>>[] = useMemo(() => [
    {
      field: 'orderNumber',
      title: 'Sipariş No',
      width: 130,
      template: (row) => <strong style={{ color: 'var(--color-primary)' }}>#{String(row.orderNumber ?? '')}</strong>,
    },
    {
      field: 'customerName',
      title: 'Müşteri',
      width: 200,
      template: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{String(row.customerName ?? '')}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{String(row.customerEmail ?? '')}</div>
        </div>
      ),
    },
    {
      field: 'totalAmount',
      title: 'Toplam',
      width: 130,
      template: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          {Number(row.totalAmount ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: String(row.currency ?? 'TRY') })}
        </span>
      ),
    },
    {
      field: 'status',
      title: 'Durum',
      width: 150,
      template: (row) => <StatusBadge status={String(row.status ?? '')} />,
    },
    {
      field: 'createdAt',
      title: 'Tarih',
      width: 160,
      template: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date(String(row.createdAt ?? '')).toLocaleString('tr-TR')}
        </span>
      ),
    },
  ], []);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaShoppingCart className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Siparişler</h2>
            <p className={s.pageSubtitle}>Tüm mağaza siparişlerini yönetin</p>
          </div>
        </div>
      </div>

      <AdvancedDataTable<Record<string, unknown>>
        key={tableKey}
        dataSource="/store-admin/orders"
        columns={columns}
        pageable={{ pageSize: 20, pageSizes: [10, 20, 50] }}
        toolbar={['search', 'excel', 'pdf']}
        filterable
        exportTitle="Siparişler"
        onDetail={openDetail}
      />

      {/* Sipariş Detay Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailOrder ? `Sipariş #${detailOrder.orderNumber}` : 'Sipariş Detayı'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>Kapat</Button>
            {newStatus && (
              <Button variant="primary" isLoading={savingStatus} onClick={handleSaveStatus}>
                Durumu Kaydet
              </Button>
            )}
          </>
        }
      >
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <FaSpinner size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          </div>
        ) : detailOrder ? (
          <>
            {/* Temel Bilgiler */}
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Sipariş No</span>
                <span className={s.detailValue} style={{ fontWeight: 700, fontSize: '1rem' }}>
                  #{detailOrder.orderNumber}
                </span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Mevcut Durum</span>
                <StatusBadge status={detailOrder.status} />
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Müşteri</span>
                <span className={s.detailValue}>{detailOrder.customerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>E-posta</span>
                <a href={`mailto:${detailOrder.customerEmail}`} className={s.detailLink}>
                  {detailOrder.customerEmail}
                </a>
              </div>
              <div className={s.detailField} style={{ gridColumn: '1 / -1' }}>
                <span className={s.detailLabel}>Teslimat Adresi</span>
                <span className={s.detailValue}>{detailOrder.shippingAddress || 'Adres bilgisi yok'}</span>
              </div>
              {detailOrder.trackingNumber && (
                <div className={s.detailField} style={{ gridColumn: '1 / -1' }}>
                  <span className={s.detailLabel}>Kargo Takip No</span>
                  <span className={s.detailValue}>
                    {detailOrder.shippingProvider && <strong>{detailOrder.shippingProvider} — </strong>}
                    {detailOrder.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Ürün Kalemleri */}
            {detailOrder.items.length > 0 && (
              <>
                <p className={s.sectionTitle} style={{ marginTop: 20 }}>Ürünler</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '8px 0', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Ürün</th>
                      <th style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Adet</th>
                      <th style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-main)' }}>
                          {item.productName}
                          {item.variantName && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> ({item.variantName})</span>}
                        </td>
                        <td style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>
                          {item.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: detailOrder.currency })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                  Toplam: {detailOrder.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: detailOrder.currency })}
                </div>
              </>
            )}

            {/* Durum Güncelleme */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
              <p className={s.sectionTitle} style={{ marginBottom: 12 }}>Durum Güncelle</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <Select
                    label="Yeni Durum"
                    value={newStatus}
                    onChange={(v) => setNewStatus(v as string)}
                    options={STATUS_OPTIONS}
                  />
                </div>
                {(newStatus === 'Shipped' || newStatus === 'Processing') && (
                  <div style={{ flex: '1 1 180px' }}>
                    <Select
                      label="Kargo Firması"
                      value={trackingNumber}
                      onChange={(v) => setTrackingNumber(v as string)}
                      options={[
                        { label: '— Seçiniz —', value: '' },
                        { label: 'Yurtiçi Kargo', value: 'yurtici' },
                        { label: 'Aras Kargo', value: 'aras' },
                        { label: 'MNG Kargo', value: 'mng' },
                        { label: 'PTT Kargo', value: 'ptt' },
                        { label: 'Sürat Kargo', value: 'surat' },
                        { label: 'UPS', value: 'ups' },
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
};
