import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaWarehouse, FaExclamationTriangle, FaCheckCircle, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { Select } from '../../../shared/ui/Select/Select';
import { apiClient } from '../../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import cs from './StoreWarehouseReportPage.module.css';

// ── DTOs ──────────────────────────────────────────────────────────────────────

interface WarehouseDto {
  id: string;
  name: string;
  code: string;
}

interface StockLevelDto {
  stockId: string;
  variantId: string;
  variantName: string;
  variantSKU: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

// ── StoreWarehouseReportPage ───────────────────────────────────────────────────

export const StoreWarehouseReportPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [stockLevels, setStockLevels] = useState<StockLevelDto[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingStock, setIsLoadingStock] = useState(true);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  // ── Fetchers ─────────────────────────────────────────────────────────────────

  const fetchWarehouses = useCallback(async () => {
    setIsLoadingWarehouses(true);
    try {
      const res = await apiClient.get<WarehouseDto[]>('/store-admin/warehouses');
      setWarehouses(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Depolar yüklenemedi.');
    } finally {
      setIsLoadingWarehouses(false);
    }
  }, []);

  const fetchStock = useCallback(async (warehouseId: string) => {
    setIsLoadingStock(true);
    try {
      const url = warehouseId
        ? `/store-admin/stock?warehouseId=${warehouseId}`
        : '/store-admin/stock';
      const res = await apiClient.get<StockLevelDto[]>(url);
      setStockLevels(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Stok seviyeleri yüklenemedi.');
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    void fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    void fetchStock(selectedWarehouseId);
  }, [fetchStock, selectedWarehouseId]);

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const sortedStock = useMemo(() => {
    return [...stockLevels].sort((a, b) => {
      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;
      return a.productName.localeCompare(b.productName, 'tr');
    });
  }, [stockLevels]);

  const totalVariants = stockLevels.length;
  const lowStockCount = stockLevels.filter((s) => s.isLowStock).length;
  const totalAvailable = stockLevels.reduce((sum, s) => sum + s.availableQuantity, 0);

  // ── Select options ────────────────────────────────────────────────────────────

  const warehouseOptions = useMemo(() => [
    { label: 'Tüm Depolar', value: '' },
    ...warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id })),
  ], [warehouses]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={s.page}>
      {/* Page Header */}
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaWarehouse className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Depo Stok Raporu</h2>
            <p className={s.pageSubtitle}>Depo bazında stok seviyelerini ve düşük stok uyarılarını görüntüleyin</p>
          </div>
        </div>
        <div style={{ minWidth: 220 }}>
          <Select
            options={warehouseOptions}
            value={selectedWarehouseId}
            onChange={(val) => setSelectedWarehouseId(String(val))}
            placeholder={isLoadingWarehouses ? 'Yükleniyor...' : 'Tüm Depolar'}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className={cs.statCards}>
        <div className={cs.statCard}>
          <div className={cs.statIconWrap} style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
            <FaBoxOpen style={{ color: 'var(--color-primary)', fontSize: '1.4rem' }} />
          </div>
          <div className={cs.statInfo}>
            <span className={cs.statLabel}>Toplam Varyant</span>
            <span className={cs.statValue}>{isLoadingStock ? '—' : totalVariants}</span>
          </div>
        </div>

        <div className={cs.statCard}>
          <div className={cs.statIconWrap} style={{ background: 'rgba(239, 68, 68, 0.10)' }}>
            <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '1.4rem' }} />
          </div>
          <div className={cs.statInfo}>
            <span className={cs.statLabel}>Düşük Stok Uyarısı</span>
            <span className={cs.statValue} style={{ color: lowStockCount > 0 ? '#ef4444' : undefined }}>
              {isLoadingStock ? '—' : lowStockCount}
            </span>
          </div>
        </div>

        <div className={cs.statCard}>
          <div className={cs.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.10)' }}>
            <FaCheckCircle style={{ color: '#10b981', fontSize: '1.4rem' }} />
          </div>
          <div className={cs.statInfo}>
            <span className={cs.statLabel}>Toplam Kullanılabilir</span>
            <span className={cs.statValue} style={{ color: '#10b981' }}>
              {isLoadingStock ? '—' : totalAvailable.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <section className={cs.section}>
        {isLoadingStock ? (
          <p className={s.muted}>Yükleniyor...</p>
        ) : sortedStock.length === 0 ? (
          <p className={s.muted}>Bu depoda stok kaydı bulunamadı.</p>
        ) : (
          <div className={cs.tableWrapper}>
            <table className={cs.table}>
              <thead>
                <tr>
                  <th>Ürün / Varyant</th>
                  <th>SKU</th>
                  <th>Depo</th>
                  <th>Mevcut</th>
                  <th>Rezerve</th>
                  <th>Kullanılabilir</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {sortedStock.map((row) => (
                  <tr key={row.stockId} className={row.isLowStock ? cs.lowStockRow : undefined}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {row.variantName}
                      </div>
                    </td>
                    <td>
                      <span className={cs.skuBadge}>{row.variantSKU}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{row.warehouseName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {row.warehouseCode}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {row.quantity.toLocaleString('tr-TR')}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {row.reservedQuantity.toLocaleString('tr-TR')}
                    </td>
                    <td style={{ fontWeight: 700, color: row.availableQuantity > 0 ? '#10b981' : '#ef4444' }}>
                      {row.availableQuantity.toLocaleString('tr-TR')}
                    </td>
                    <td>
                      {row.isLowStock ? (
                        <span className={cs.badgeLowStock}>Düşük Stok</span>
                      ) : (
                        <span className={cs.badgeNormal}>Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
