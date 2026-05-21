import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaShoppingCart, FaTruck, FaCheckCircle, FaClock,
  FaTimesCircle, FaUndo,
} from 'react-icons/fa';
import { AdvancedDataTable } from '../../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { apiClient } from '../../../../shared/api/axiosConfig';
import { toast } from 'react-hot-toast';
import s from './storeAdmin.shared.module.css';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  Pending:    { label: 'Bekliyor',      color: '#6b7280', icon: FaClock },
  Paid:       { label: 'Ödendi',        color: '#3b82f6', icon: FaCheckCircle },
  Processing: { label: 'Hazırlanıyor',  color: '#8b5cf6', icon: FaClock },
  Shipped:    { label: 'Kargoda',       color: '#f59e0b', icon: FaTruck },
  Delivered:  { label: 'Teslim Edildi', color: '#10b981', icon: FaCheckCircle },
  Cancelled:  { label: 'İptal',         color: '#ef4444', icon: FaTimesCircle },
  Refunded:   { label: 'İade',          color: '#ec4899', icon: FaUndo },
};

export const StoreOrdersPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const handleUpdateStatus = useCallback(async (order: Record<string, unknown>, newStatus: string) => {
    try {
      await apiClient.patch(`/store-admin/orders/${order.id}/status`, {
        id: order.id,
        status: newStatus,
      });
      toast.success('Sipariş durumu güncellendi.');
    } catch {
      toast.error('Güncelleme başarısız oldu.');
    }
  }, []);

  const renderDetailModal = useCallback((order: Record<string, unknown>, onClose: () => void) => (
    <div className={s.modalBody} style={{ minWidth: 'min(560px, 90vw)' }}>
      <div className={s.detailGrid}>
        <div className={s.detailField}>
          <span className={s.detailLabel}>Sipariş No</span>
          <span className={s.detailValue} style={{ fontWeight: 700, fontSize: '1rem' }}>
            #{String(order.orderNumber ?? '')}
          </span>
        </div>
        <div className={s.detailField}>
          <span className={s.detailLabel}>Durum</span>
          {(() => {
            const cfg = statusConfig[String(order.status ?? '')] ?? { label: String(order.status ?? ''), color: '#6b7280', icon: FaClock };
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
          })()}
        </div>
        <div className={s.detailField}>
          <span className={s.detailLabel}>Müşteri</span>
          <span className={s.detailValue}>{String(order.customerName ?? '')}</span>
        </div>
        <div className={s.detailField}>
          <span className={s.detailLabel}>E-posta</span>
          <a href={`mailto:${order.customerEmail}`} className={s.detailLink}>{String(order.customerEmail ?? '')}</a>
        </div>
        <div className={s.detailField} style={{ gridColumn: '1 / -1' }}>
          <span className={s.detailLabel}>Teslimat Adresi</span>
          <span className={s.detailValue}>{String(order.shippingAddress ?? 'Adres bilgisi yok')}</span>
        </div>
      </div>

      {Array.isArray(order.items) && order.items.length > 0 && (
        <>
          <p className={s.sectionTitle} style={{ marginTop: 16 }}>Ürünler</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '8px 0', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Ürün</th>
                <th style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Adet</th>
                <th style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {(order.items as Record<string, unknown>[]).map((item, i) => (
                <tr key={String(item.id ?? i)} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text-main)' }}>{String(item.productName ?? '')}</td>
                  <td style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{String(item.quantity ?? '')}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-main)', fontWeight: 600 }}>
                    {Number(item.totalPrice).toLocaleString('tr-TR', { style: 'currency', currency: String(order.currency ?? 'TRY') })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
          Toplam: {Number(order.totalAmount ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: String(order.currency ?? 'TRY') })}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {String(order.status ?? '') !== 'Shipped' && String(order.status ?? '') !== 'Delivered' && (
            <button
              className={s.saveBtn}
              onClick={() => { void handleUpdateStatus(order, 'Shipped'); onClose(); }}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <FaTruck size={12} />
              Kargoya Ver
            </button>
          )}
          <button className={s.cancelBtn} onClick={onClose} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  ), [handleUpdateStatus]);

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
      template: (row) => {
        const cfg = statusConfig[String(row.status ?? '')] ?? { label: String(row.status ?? ''), color: '#6b7280', icon: FaClock };
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
      },
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
        dataSource="/store-admin/orders"
        columns={columns}
        pageable={{ pageSize: 20, pageSizes: [10, 20, 50] }}
        toolbar={['search', 'excel', 'pdf']}
        filterable
        exportTitle="Siparişler"
        onDetail={() => { /* handled by detailModal */ }}
        detailModal={renderDetailModal}
      />
    </div>
  );
};
