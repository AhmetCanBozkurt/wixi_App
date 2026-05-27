import { useEffect, useState, useCallback } from 'react';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import apiClient from '../../../shared/api/axiosConfig';
import styles from './BudgetsPage.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetItem {
  id: string;
  name: string;
  totalAmount: number;
  totalSpent: number;
  totalRemaining: number;
  startDate: string;
  endDate: string;
  status: string;     // "Active" | "Completed" | "Cancelled"  (JsonStringEnumConverter)
  periodType: string; // "Weekly" | "Monthly" | "Yearly"       (JsonStringEnumConverter)
  autoRenew: boolean;
  categoryCount: number;
  notes?: string | null;
}

interface BudgetsApiResponse {
  success: boolean;
  data: { items: BudgetItem[]; totalCount: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

// POST/PUT body → enum string values (JsonStringEnumConverter)
// BudgetPeriodType: Weekly=1, Monthly=2, Yearly=3
const PERIOD_OPTIONS = [
  { label: 'Aylık',    value: 'Monthly' },
  { label: 'Haftalık', value: 'Weekly'  },
  { label: 'Yıllık',   value: 'Yearly'  },
];

// GET filter → query param (enum string name)
// BudgetStatus: Active=1, Completed=2, Cancelled=3
const STATUS_FILTER_OPTIONS = [
  { label: '— Tümü —',    value: ''          },
  { label: 'Aktif',        value: 'Active'    },
  { label: 'Tamamlandı',   value: 'Completed' },
  { label: 'İptal Edildi', value: 'Cancelled' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number | undefined | null) {
  return (n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function getSpentPercent(spent: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((spent / total) * 100));
}

function getStatusLabel(s: string) {
  if (s === 'Active')    return 'Aktif';
  if (s === 'Completed') return 'Tamamlandı';
  return 'İptal';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BudgetsPage = () => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Active'); // default: active

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [formStart, setFormStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [formEnd, setFormEnd] = useState('');
  const [formPeriod, setFormPeriod] = useState('Monthly');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const isFormOpen = createOpen || !!editItem;

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: 1, pageSize: 50 };
      if (filterStatus) params.status = filterStatus;
      const res = await apiClient.get<BudgetsApiResponse>('/me/finance/budgets', { params });
      setBudgets(res.data.data?.items ?? []);
      setTotalCount(res.data.data?.totalCount ?? 0);
    } catch {
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openCreate = () => {
    setFormName(''); setFormTotal(''); setFormStart(new Date().toISOString().split('T')[0]);
    setFormEnd(''); setFormPeriod('Monthly'); setFormNotes(''); setFormError('');
    setCreateOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setFormName(item.name);
    setFormTotal(String(item.totalAmount));
    setFormStart(item.startDate.split('T')[0]);
    setFormEnd(item.endDate ? item.endDate.split('T')[0] : '');
    setFormPeriod(item.periodType); // API returns string enum
    setFormNotes(item.notes ?? '');
    setFormError('');
    setEditItem(item);
  };

  const handleClose = () => { setCreateOpen(false); setEditItem(null); };

  const handleSave = async () => {
    setFormError('');
    if (!formName.trim()) { setFormError('Bütçe adı zorunludur.'); return; }
    if (!formTotal || Number(formTotal) <= 0) { setFormError('Geçerli bir tutar giriniz.'); return; }
    if (!formStart) { setFormError('Başlangıç tarihi zorunludur.'); return; }
    if (!formEnd) { setFormError('Bitiş tarihi zorunludur.'); return; }

    setIsSaving(true);
    try {
      const body = {
        name: formName.trim(),
        totalAmount: Number(formTotal),
        startDate: formStart,
        endDate: formEnd,
        periodType: formPeriod, // string enum: "Monthly" | "Weekly" | "Yearly"
        notes: formNotes.trim() || null,
      };
      if (editItem) {
        await apiClient.put(`/me/finance/budgets/${editItem.id}`, body);
      } else {
        await apiClient.post('/me/finance/budgets', body);
      }
      handleClose();
      fetchBudgets();
    } catch {
      setFormError('Bir hata oluştu, tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/me/finance/budgets/${deleteId}`);
      setDeleteId(null);
      fetchBudgets();
    } catch {
      // axios interceptor handles
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bütçeler</h1>
          <p className={styles.pageSubtitle}>Harcama bütçelerinizi yönetin · {totalCount} bütçe</p>
        </div>
        <div className={styles.headerRight}>
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={filterStatus}
            onChange={(v) => setFilterStatus(String(v))}
          />
          <Button variant="primary" leftIcon={<FaPlus />} onClick={openCreate}>
            Yeni Bütçe
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.budgetCard} ${styles.skeleton}`} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className={styles.empty}>
          <FaClock className={styles.emptyIcon} />
          <p>Henüz bütçe yok.</p>
          <Button variant="primary" leftIcon={<FaPlus />} onClick={openCreate}>İlk Bütçeni Oluştur</Button>
        </div>
      ) : (
        <div className={styles.budgetGrid}>
          {budgets.map((b) => {
            const pct = getSpentPercent(b.totalSpent, b.totalAmount);
            const isOver = b.totalSpent > b.totalAmount;
            return (
              <div key={b.id} className={styles.budgetCard}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.cardName}>{b.name}</div>
                    <div className={styles.cardDates}>{formatDate(b.startDate)} – {formatDate(b.endDate)}</div>
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: b.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                      color: b.status === 'Active' ? '#10b981' : '#6366f1',
                    }}
                  >
                    {b.status === 'Completed' && <FaCheckCircle style={{ marginRight: 4 }} />}
                    {getStatusLabel(b.status)}
                  </span>
                </div>

                <div className={styles.amounts}>
                  <span className={styles.spent} style={{ color: isOver ? '#ef4444' : undefined }}>
                    ₺ {formatAmount(b.totalSpent)}
                  </span>
                  <span className={styles.total}>/ ₺ {formatAmount(b.totalAmount)}</span>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${pct}%`,
                      background: isOver ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
                <div className={styles.pctLabel} style={{ color: isOver ? '#ef4444' : undefined }}>
                  %{pct} kullanıldı
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.iconBtn} onClick={() => openEdit(b)}><FaPencilAlt /></button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteId(b.id)}><FaTrashAlt /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleClose}
        title={editItem ? 'Bütçeyi Düzenle' : 'Yeni Bütçe'}
        size="md"
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
          <Input label="Bütçe Adı" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <Input label="Toplam Tutar (₺)" type="number" value={formTotal} onChange={(e) => setFormTotal(e.target.value)} min="0" step="0.01" required />
          <Select label="Dönem" options={PERIOD_OPTIONS} value={formPeriod} onChange={(v) => setFormPeriod(String(v))} />
          <div className={styles.row2}>
            <Input label="Başlangıç" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} required />
            <Input label="Bitiş" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} required />
          </div>
          <Input label="Notlar" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
          {formError && <p className={styles.error}>{formError}</p>}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Bütçeyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-main)' }}>Bu bütçeyi silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};
