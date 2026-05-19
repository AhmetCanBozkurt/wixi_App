import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaWarehouse, FaPlus, FaExchangeAlt, FaBoxOpen, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { Modal } from '../../shared/ui/Modal/Modal';
import { Input } from '../../shared/ui/Input/Input';
import { Select } from '../../shared/ui/Select/Select';
import { Button } from '../../shared/ui/Button/Button';
import { Switch } from '../../shared/ui/Switch/Switch';
import { apiClient } from '../../shared/api/axiosConfig';
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import cs from './StoreStockPage.module.css';

// ── DTOs ──────────────────────────────────────────────────────────────────────

interface WarehouseDto {
  id: string;
  name: string;
  code: string;
  address?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ProductLookup {
  id: string;
  name: string;
}

interface VariantLookup {
  id: string;
  name: string;
  sku: string;
}

interface StockMovementDto {
  id: string;
  variantName: string;
  variantSKU: string;
  productName: string;
  warehouseName: string;
  movementTypeName: string;
  quantity: number;
  notes?: string;
  movementDate: string;
  toWarehouseName?: string;
  createdByUser?: string;
}

interface WarehouseFormData {
  name: string;
  code: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
}

interface MovementFormData {
  productId: string;
  variantId: string;
  warehouseId: string;
  type: string;
  quantity: string;
  notes: string;
  toWarehouseId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MOVEMENT_TYPE_OPTIONS = [
  { label: '— Hareket Tipi Seçin —', value: '' },
  { label: 'Mal Girişi (GRN)', value: '1' },
  { label: 'Satış (SALE)', value: '2' },
  { label: 'İade (RTN)', value: '3' },
  { label: 'Depo Transferi (TRF)', value: '4' },
  { label: 'Düzeltme (ADJ)', value: '5' },
];

const EMPTY_WAREHOUSE_FORM: WarehouseFormData = {
  name: '',
  code: '',
  address: '',
  isDefault: false,
  isActive: true,
};

const EMPTY_MOVEMENT_FORM: MovementFormData = {
  productId: '',
  variantId: '',
  warehouseId: '',
  type: '',
  quantity: '',
  notes: '',
  toWarehouseId: '',
};

// ── StoreStockPage ─────────────────────────────────────────────────────────────

export const StoreStockPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // Warehouse state
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [warehouseForm, setWarehouseForm] = useState<WarehouseFormData>(EMPTY_WAREHOUSE_FORM);
  const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);

  // Movement state
  const [movements, setMovements] = useState<StockMovementDto[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [movementForm, setMovementForm] = useState<MovementFormData>(EMPTY_MOVEMENT_FORM);
  const [isSavingMovement, setIsSavingMovement] = useState(false);

  // Lookup state
  const [products, setProducts] = useState<ProductLookup[]>([]);
  const [variants, setVariants] = useState<VariantLookup[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

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

  const fetchMovements = useCallback(async () => {
    setIsLoadingMovements(true);
    try {
      const res = await apiClient.get<{ items: StockMovementDto[]; totalCount: number }>(
        '/store-admin/stock/movements?pageSize=50'
      );
      const data = Array.isArray(res.data)
        ? (res.data as unknown as StockMovementDto[])
        : (res.data?.items ?? []);
      setMovements(data);
    } catch {
      toast.error('Stok hareketleri yüklenemedi.');
    } finally {
      setIsLoadingMovements(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiClient.get<ProductLookup[] | { items: ProductLookup[] }>(
        '/store-admin/products'
      );
      const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      setProducts(data);
    } catch {
      // silent — not critical
    }
  }, []);

  const fetchVariants = useCallback(async (productId: string) => {
    if (!productId) {
      setVariants([]);
      return;
    }
    setIsLoadingVariants(true);
    try {
      const res = await apiClient.get<VariantLookup[]>(
        `/store-admin/products/${productId}/variants`
      );
      setVariants(Array.isArray(res.data) ? res.data : []);
    } catch {
      setVariants([]);
    } finally {
      setIsLoadingVariants(false);
    }
  }, []);

  useEffect(() => {
    void fetchWarehouses();
    void fetchMovements();
    void fetchProducts();
  }, [fetchWarehouses, fetchMovements, fetchProducts]);

  // ── Warehouse handlers ────────────────────────────────────────────────────────

  const openCreateWarehouse = () => {
    setEditingWarehouseId(null);
    setWarehouseForm(EMPTY_WAREHOUSE_FORM);
    setIsWarehouseModalOpen(true);
  };

  const openEditWarehouse = (wh: WarehouseDto) => {
    setEditingWarehouseId(wh.id);
    setWarehouseForm({
      name: wh.name,
      code: wh.code,
      address: wh.address ?? '',
      isDefault: wh.isDefault,
      isActive: wh.isActive,
    });
    setIsWarehouseModalOpen(true);
  };

  const closeWarehouseModal = () => {
    setIsWarehouseModalOpen(false);
    setEditingWarehouseId(null);
    setWarehouseForm(EMPTY_WAREHOUSE_FORM);
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseForm.name.trim()) { toast.error('Depo adı zorunludur.'); return; }
    if (!warehouseForm.code.trim()) { toast.error('Depo kodu zorunludur.'); return; }
    setIsSavingWarehouse(true);
    try {
      const payload = {
        name: warehouseForm.name.trim(),
        code: warehouseForm.code.trim(),
        address: warehouseForm.address.trim() || null,
        isDefault: warehouseForm.isDefault,
        isActive: warehouseForm.isActive,
      };
      if (editingWarehouseId) {
        await apiClient.put(`/store-admin/warehouses/${editingWarehouseId}`, {
          id: editingWarehouseId,
          ...payload,
        });
        toast.success('Depo güncellendi.');
      } else {
        await apiClient.post('/store-admin/warehouses', payload);
        toast.success('Depo oluşturuldu.');
      }
      closeWarehouseModal();
      void fetchWarehouses();
    } catch {
      toast.error('Depo kaydedilirken hata oluştu.');
    } finally {
      setIsSavingWarehouse(false);
    }
  };

  // ── Movement handlers ─────────────────────────────────────────────────────────

  const handleProductChange = (val: string | number) => {
    const productId = String(val);
    setMovementForm((p) => ({ ...p, productId, variantId: '' }));
    setVariants([]);
    void fetchVariants(productId);
  };

  const handleSubmitMovement = async () => {
    if (!movementForm.variantId) { toast.error('Varyant seçiniz.'); return; }
    if (!movementForm.warehouseId) { toast.error('Depo seçiniz.'); return; }
    if (!movementForm.type) { toast.error('Hareket tipi seçiniz.'); return; }
    const qty = parseInt(movementForm.quantity);
    if (isNaN(qty) || qty <= 0) { toast.error('Geçerli bir miktar girin.'); return; }
    if (movementForm.type === '4' && !movementForm.toWarehouseId) {
      toast.error('Transfer için hedef depo seçiniz.');
      return;
    }
    setIsSavingMovement(true);
    try {
      const payload = {
        variantId: movementForm.variantId,
        warehouseId: movementForm.warehouseId,
        type: parseInt(movementForm.type),
        quantity: qty,
        notes: movementForm.notes.trim() || null,
        toWarehouseId: movementForm.type === '4' ? movementForm.toWarehouseId : null,
      };
      await apiClient.post('/store-admin/stock/movements', payload);
      toast.success('Stok hareketi kaydedildi.');
      setMovementForm(EMPTY_MOVEMENT_FORM);
      setVariants([]);
      void fetchMovements();
    } catch {
      toast.error('Stok hareketi kaydedilirken hata oluştu.');
    } finally {
      setIsSavingMovement(false);
    }
  };

  // ── Select options ────────────────────────────────────────────────────────────

  const productOptions = useMemo(() => [
    { label: '— Ürün Seçin —', value: '' },
    ...products.map((p) => ({ label: p.name, value: p.id })),
  ], [products]);

  const variantOptions = useMemo(() => [
    { label: isLoadingVariants ? 'Yükleniyor...' : '— Varyant Seçin —', value: '' },
    ...variants.map((v) => ({ label: `${v.name} (${v.sku})`, value: v.id })),
  ], [variants, isLoadingVariants]);

  const warehouseOptions = useMemo(() => [
    { label: '— Depo Seçin —', value: '' },
    ...warehouses.map((w) => ({ label: w.name, value: w.id })),
  ], [warehouses]);

  const toWarehouseOptions = useMemo(() => [
    { label: '— Hedef Depo Seçin —', value: '' },
    ...warehouses
      .filter((w) => w.id !== movementForm.warehouseId)
      .map((w) => ({ label: w.name, value: w.id })),
  ], [warehouses, movementForm.warehouseId]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={s.page}>
      {/* Page Header */}
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaWarehouse className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Depo & Stok</h2>
            <p className={s.pageSubtitle}>Depoları yönetin ve stok hareketlerini kaydedin</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<FaPlus />} onClick={openCreateWarehouse}>
          Yeni Depo
        </Button>
      </div>

      {/* Warehouses Section */}
      <section className={cs.section}>
        <p className={s.sectionTitle}>
          <FaWarehouse style={{ marginRight: 8 }} />
          Depolar
        </p>
        {isLoadingWarehouses ? (
          <p className={s.muted}>Yükleniyor...</p>
        ) : warehouses.length === 0 ? (
          <p className={s.muted}>Henüz depo eklenmemiş.</p>
        ) : (
          <div className={cs.tableWrapper}>
            <table className={cs.table}>
              <thead>
                <tr>
                  <th>Depo Adı</th>
                  <th>Kod</th>
                  <th>Adres</th>
                  <th>Varsayılan</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((wh) => (
                  <tr key={wh.id}>
                    <td style={{ fontWeight: 600 }}>{wh.name}</td>
                    <td>
                      <span className={cs.codeBadge}>{wh.code}</span>
                    </td>
                    <td className={s.muted}>{wh.address || '—'}</td>
                    <td>
                      {wh.isDefault ? (
                        <span className={s.badgeActive}>Varsayılan</span>
                      ) : (
                        <span className={s.badgeInactive}>Hayır</span>
                      )}
                    </td>
                    <td>
                      <span className={wh.isActive ? s.badgeActive : s.badgeInactive}>
                        {wh.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaEdit />}
                        onClick={() => openEditWarehouse(wh)}
                      >
                        Düzenle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Stock Movement Form */}
      <section className={cs.section}>
        <p className={s.sectionTitle}>
          <FaExchangeAlt style={{ marginRight: 8 }} />
          Stok Hareketi Ekle
        </p>
        <div className={cs.formCard}>
          <div className={s.formGrid}>
            <Select
              label="Ürün *"
              options={productOptions}
              value={movementForm.productId}
              onChange={handleProductChange}
            />
            <Select
              label="Varyant *"
              options={variantOptions}
              value={movementForm.variantId}
              onChange={(val) => setMovementForm((p) => ({ ...p, variantId: String(val) }))}
            />
          </div>

          <div className={s.formGrid}>
            <Select
              label="Depo *"
              options={warehouseOptions}
              value={movementForm.warehouseId}
              onChange={(val) => setMovementForm((p) => ({ ...p, warehouseId: String(val) }))}
            />
            <Select
              label="Hareket Tipi *"
              options={MOVEMENT_TYPE_OPTIONS}
              value={movementForm.type}
              onChange={(val) => setMovementForm((p) => ({ ...p, type: String(val) }))}
            />
          </div>

          {movementForm.type === '4' && (
            <div className={s.formRow}>
              <Select
                label="Hedef Depo *"
                options={toWarehouseOptions}
                value={movementForm.toWarehouseId}
                onChange={(val) => setMovementForm((p) => ({ ...p, toWarehouseId: String(val) }))}
              />
            </div>
          )}

          <div className={s.formGrid}>
            <Input
              label="Miktar *"
              type="number"
              value={movementForm.quantity}
              onChange={(e) => setMovementForm((p) => ({ ...p, quantity: e.target.value }))}
              placeholder="0"
              min="1"
              step="1"
            />
            <div />
          </div>

          <div className={s.formRow}>
            <label className={s.label}>Notlar</label>
            <textarea
              className={s.textarea}
              value={movementForm.notes}
              onChange={(e) => setMovementForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="İsteğe bağlı notlar"
              rows={3}
            />
          </div>

          <div className={cs.formActions}>
            <Button
              variant="primary"
              leftIcon={<FaExchangeAlt />}
              isLoading={isSavingMovement}
              onClick={() => void handleSubmitMovement()}
            >
              Hareketi Kaydet
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Movements */}
      <section className={cs.section}>
        <p className={s.sectionTitle}>
          <FaBoxOpen style={{ marginRight: 8 }} />
          Son Hareketler
        </p>
        {isLoadingMovements ? (
          <p className={s.muted}>Yükleniyor...</p>
        ) : movements.length === 0 ? (
          <p className={s.muted}>Henüz stok hareketi kaydedilmemiş.</p>
        ) : (
          <div className={cs.tableWrapper}>
            <table className={cs.table}>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Ürün / Varyant</th>
                  <th>Depo</th>
                  <th>Tip</th>
                  <th>Miktar</th>
                  <th>Notlar</th>
                  <th>Kullanıcı</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((row) => (
                  <tr key={row.id}>
                    <td className={s.muted} style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(row.movementDate).toLocaleString('tr-TR')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {row.variantName} · {row.variantSKU}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{row.warehouseName}</div>
                      {row.toWarehouseName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          → {row.toWarehouseName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={cs.typeBadge}>{row.movementTypeName}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.quantity > 0 ? '#10b981' : '#ef4444',
                        }}
                      >
                        {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                      </span>
                    </td>
                    <td className={s.muted} style={{ fontSize: '0.82rem', maxWidth: 180 }}>
                      {row.notes || '—'}
                    </td>
                    <td className={s.muted} style={{ fontSize: '0.82rem' }}>
                      {row.createdByUser || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Warehouse Modal */}
      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={closeWarehouseModal}
        title={editingWarehouseId ? 'Depo Düzenle' : 'Yeni Depo'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeWarehouseModal}>
              İptal
            </Button>
            <Button
              variant="primary"
              isLoading={isSavingWarehouse}
              onClick={() => void handleSaveWarehouse()}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Depo Adı *"
            value={warehouseForm.name}
            onChange={(e) => setWarehouseForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="örn. Ana Depo"
          />
          <Input
            label="Kod *"
            value={warehouseForm.code}
            onChange={(e) => setWarehouseForm((p) => ({ ...p, code: e.target.value }))}
            placeholder="örn. WH-001"
          />
        </div>

        <div className={s.formRow}>
          <Input
            label="Adres"
            value={warehouseForm.address}
            onChange={(e) => setWarehouseForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Depo adresi (isteğe bağlı)"
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: 4 }}>
          <Switch
            label="Varsayılan Depo"
            checked={warehouseForm.isDefault}
            onChange={(e) => setWarehouseForm((p) => ({ ...p, isDefault: e.target.checked }))}
          />
          <Switch
            label="Aktif"
            checked={warehouseForm.isActive}
            onChange={(e) => setWarehouseForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
        </div>
      </Modal>
    </div>
  );
};
