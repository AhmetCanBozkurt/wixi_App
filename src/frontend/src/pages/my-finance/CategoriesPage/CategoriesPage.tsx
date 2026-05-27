import { useEffect, useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { FaPlus, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import apiClient from '../../../shared/api/axiosConfig';
import styles from './CategoriesPage.module.css';

interface ErrorResponseData {
  message?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  type: string; // "Income" | "Expense" | "Both"  (JsonStringEnumConverter)
  color: string;
  icon: string;
  isDefault: boolean;
  isSystem: boolean;
}

interface CategoriesApiResponse {
  success: boolean;
  data: CategoryItem[]; // backend direkt array döner, { items } wrapper yok
}

// ─── Constants ────────────────────────────────────────────────────────────────

// POST/PUT body → enum string values (JsonStringEnumConverter)
const TYPE_OPTIONS = [
  { label: 'Gider', value: 'Expense' },
  { label: 'Gelir', value: 'Income' },
  { label: 'Her İkisi', value: 'Both' },
];

// GET filter → query param (numeric model binding, enum string name also works)
const TYPE_FILTER_OPTIONS = [
  { label: '— Tümü —', value: '' },
  { label: 'Gelir', value: 'Income' },
  { label: 'Gider', value: 'Expense' },
];

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#64748b', '#374151',
];

function getTypeLabel(t: string) {
  if (t === 'Income') return 'Gelir';
  if (t === 'Expense') return 'Gider';
  return 'Her İkisi';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('');

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Expense');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formIcon, setFormIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  /* formType değerleri: 'Expense' | 'Income' | 'Both' */
  const [formError, setFormError] = useState('');

  const isFormOpen = createOpen || !!editItem;

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      const res = await apiClient.get<CategoriesApiResponse>('/me/finance/categories', { params });
      setCategories(res.data.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setFormName(''); setFormType('Expense'); setFormColor('#6366f1'); setFormIcon(''); setFormError('');
    setCreateOpen(true);
  };

  const openEdit = (item: CategoryItem) => {
    setFormName(item.name); setFormType(item.type); // API returns string enum
    setFormColor(item.color || '#6366f1'); setFormIcon(item.icon || ''); setFormError('');
    setEditItem(item);
  };

  const handleClose = () => { setCreateOpen(false); setEditItem(null); };

  const handleSave = async () => {
    setFormError('');
    if (!formName.trim()) { setFormError('Kategori adı zorunludur.'); return; }
    setIsSaving(true);
    try {
      const body = { name: formName.trim(), type: formType, color: formColor, icon: formIcon.trim() || '📁' };
      if (editItem) {
        await apiClient.put(`/me/finance/categories/${editItem.id}`, body);
      } else {
        await apiClient.post('/me/finance/categories', body);
      }
      handleClose();
      fetchCategories();
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponseData>;
      setFormError(axiosErr.response?.data?.message ?? 'Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/me/finance/categories/${deleteId}`);
      setDeleteId(null);
      fetchCategories();
    } catch {
      // axios interceptor handles
    } finally {
      setIsDeleting(false);
    }
  };

  const userCategories = categories.filter((c) => !c.isSystem);
  const systemCategories = categories.filter((c) => c.isSystem);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Kategoriler</h1>
          <p className={styles.pageSubtitle}>Gelir & gider kategorilerinizi yönetin</p>
        </div>
        <div className={styles.headerRight}>
          <Select
            options={TYPE_FILTER_OPTIONS}
            value={filterType}
            onChange={(v) => setFilterType(String(v))}
          />
          <Button variant="primary" leftIcon={<FaPlus />} onClick={openCreate}>
            Yeni Kategori
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingRow}>Yükleniyor...</div>
      ) : (
        <>
          {/* User Categories */}
          {userCategories.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Kişisel Kategorilerim</div>
              <div className={styles.categoryGrid}>
                {userCategories.map((c) => (
                  <div key={c.id} className={styles.categoryCard}>
                    <div className={styles.categoryLeft}>
                      <div className={styles.categoryDot} style={{ background: c.color || '#6366f1' }}>
                        {c.icon || '📁'}
                      </div>
                      <div>
                        <div className={styles.categoryName}>{c.name}</div>
                        <div className={styles.categoryType}>{getTypeLabel(c.type)}</div>
                      </div>
                    </div>
                    <div className={styles.categoryActions}>
                      <button className={styles.iconBtn} onClick={() => openEdit(c)}><FaPencilAlt /></button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteId(c.id)}><FaTrashAlt /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userCategories.length === 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Kişisel Kategorilerim</div>
              <div className={styles.emptySection}>
                Henüz kişisel kategori yok.
                <button className={styles.inlineLink} onClick={openCreate}>Ekle</button>
              </div>
            </div>
          )}

          {/* System / Default Categories */}
          {systemCategories.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Varsayılan Kategoriler</div>
              <div className={styles.categoryGrid}>
                {systemCategories.map((c) => (
                  <div key={c.id} className={`${styles.categoryCard} ${styles.systemCard}`}>
                    <div className={styles.categoryLeft}>
                      <div className={styles.categoryDot} style={{ background: c.color || '#6366f1' }}>
                        {c.icon || '📁'}
                      </div>
                      <div>
                        <div className={styles.categoryName}>{c.name}</div>
                        <div className={styles.categoryType}>{getTypeLabel(c.type)}</div>
                      </div>
                    </div>
                    <span className={styles.systemBadge}>Sistem</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={editItem ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={handleClose}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
              {editItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <Input label="Kategori Adı" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <Select label="Tür" options={TYPE_OPTIONS} value={formType} onChange={(v) => setFormType(String(v))} />
          <Input label="İkon (emoji)" value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="🛒" />
          <div>
            <div className={styles.colorLabel}>Renk</div>
            <div className={styles.colorPalette}>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`${styles.colorSwatch} ${formColor === c ? styles.colorSwatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setFormColor(c)}
                />
              ))}
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className={styles.colorPicker}
                title="Özel renk seç"
              />
            </div>
          </div>
          {formError && <p className={styles.error}>{formError}</p>}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Kategoriyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-main)' }}>Bu kategoriyi silmek istediğinizden emin misiniz? İşlemlerle bağlı olması durumunda sadece gizlenir.</p>
      </Modal>
    </div>
  );
};
