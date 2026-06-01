import { useEffect, useState, useCallback } from 'react';
import { FaPencilAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Select } from '../../../shared/ui/Select/Select';
import { Input } from '../../../shared/ui/Input/Input';
import { TransactionModal } from './components/TransactionModal/TransactionModal';
import apiClient from '../../../shared/api/axiosConfig';
import styles from './TransactionsPage.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetId: string | null;
  householdId: string | null;
  amount: number;
  description: string;
  date: string;
  type: string; // "Income" | "Expense"  (JsonStringEnumConverter)
  isInstallment: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  type: string; // "Income" | "Expense" | "Both"  (JsonStringEnumConverter)
  color: string;
  icon: string;
  isDefault: boolean;
  isSystem: boolean;
}

interface TransactionsApiResponse {
  success: boolean;
  data: { items: TransactionItem[]; totalCount: number };
}

interface CategoriesApiResponse {
  success: boolean;
  data: CategoryItem[]; // backend direkt array döner, { items } wrapper yok
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TX_TYPES = [
  { label: '— Tümü —', value: '' },
  { label: 'Gelir', value: '1' },
  { label: 'Gider', value: '2' },
];

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function buildPageNumbers(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransactionItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (filterType) params.type = filterType;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      if (filterSearch) params.search = filterSearch;

      const res = await apiClient.get<TransactionsApiResponse>('/me/finance/transactions', { params });
      setTransactions(res.data.data?.items ?? []);
      setTotalCount(res.data.data?.totalCount ?? 0);
    } catch {
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterType, filterCategoryId, filterFrom, filterTo, filterSearch]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get<CategoriesApiResponse>('/me/finance/categories');
      setCategories(res.data.data ?? []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterType, filterCategoryId, filterFrom, filterTo, filterSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/me/finance/transactions/${deleteId}`);
      setDeleteId(null);
      fetchTransactions();
    } catch {
      // error is handled by the axios interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryFilterOptions = [
    { label: '— Tüm Kategoriler —', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>İşlemler</h1>
          <p className={styles.pageSubtitle}>Tüm gelir ve gider işlemleriniz</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<FaPlus />}
          onClick={() => setCreateOpen(true)}
        >
          Yeni İşlem
        </Button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <Select
          options={TX_TYPES}
          value={filterType}
          onChange={(v) => setFilterType(String(v))}
          placeholder="Tür"
        />
        <Select
          options={categoryFilterOptions}
          value={filterCategoryId}
          onChange={(v) => setFilterCategoryId(String(v))}
          placeholder="Kategori"
        />
        <Input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          placeholder="Başlangıç"
        />
        <Input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          placeholder="Bitiş"
        />
        <Input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Ara..."
        />
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingRow}>Yükleniyor...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                  <th>Kategori</th>
                  <th>Tür</th>
                  <th className={styles.amountCol}>Tutar</th>
                  <th className={styles.actionsCol}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      Gösterilecek işlem bulunamadı.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.dateCell}>{formatDate(tx.date)}</td>
                      <td className={styles.descCell}>{tx.description}</td>
                      <td>
                        <div className={styles.categoryCell}>
                          <span
                            className={styles.categoryDot}
                            style={{ background: tx.categoryColor || '#6366f1' }}
                          />
                          {tx.categoryIcon && (
                            <span className={styles.categoryIcon}>{tx.categoryIcon}</span>
                          )}
                          <span>{tx.categoryName}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.typeBadge}
                          style={{
                            background: tx.type === 'Income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: tx.type === 'Income' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {tx.type === 'Income' ? 'Gelir' : 'Gider'}
                        </span>
                      </td>
                      <td
                        className={styles.amountCell}
                        style={{ color: tx.type === 'Income' ? '#10b981' : '#ef4444' }}
                      >
                        ₺ {formatAmount(tx.amount)}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => setEditItem(tx)}
                          aria-label="Düzenle"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          onClick={() => setDeleteId(tx.id)}
                          aria-label="Sil"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Geri
          </button>
          {buildPageNumbers(page, totalPages).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            İleri
          </button>
        </div>
      )}

      {/* Create Modal */}
      <TransactionModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={fetchTransactions}
        categories={categories}
      />

      {/* Edit Modal */}
      <TransactionModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSaved={fetchTransactions}
        editItem={editItem}
        categories={categories}
      />

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="İşlemi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Evet, Sil
            </Button>
          </>
        }
      >
        <p className={styles.deleteConfirmText}>
          Bu işlemi silmek istediğinizden emin misiniz?
        </p>
      </Modal>
    </div>
  );
};
