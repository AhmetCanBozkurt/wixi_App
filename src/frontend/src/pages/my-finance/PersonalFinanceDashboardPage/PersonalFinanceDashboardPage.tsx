import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import apiClient from '../../../shared/api/axiosConfig';
import styles from './PersonalFinanceDashboardPage.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiTotalResponse {
  success: boolean;
  data: { total: number; type: number };
}

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
  type: number;
  isInstallment: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransactionsResponse {
  success: boolean;
  data: { items: TransactionItem[]; totalCount: number };
}

interface BudgetsResponse {
  success: boolean;
  data: { totalCount: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { from: fmt(from), to: fmt(to) };
}

function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PersonalFinanceDashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [budgetCount, setBudgetCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const { from, to } = getMonthRange();

    const fetchAll = async () => {
      setIsLoading(true);
      const results = await Promise.allSettled([
        apiClient.get<ApiTotalResponse>(`/me/finance/transactions/total`, { params: { type: 1, from, to } }),
        apiClient.get<ApiTotalResponse>(`/me/finance/transactions/total`, { params: { type: 2, from, to } }),
        apiClient.get<BudgetsResponse>(`/me/finance/budgets`, { params: { status: 1, pageSize: 1 } }),
        apiClient.get<TransactionsResponse>(`/me/finance/transactions`, { params: { pageSize: 5, page: 1 } }),
      ]);

      if (results[0].status === 'fulfilled') {
        setIncome(results[0].value.data.data?.total ?? 0);
      }
      if (results[1].status === 'fulfilled') {
        setExpense(results[1].value.data.data?.total ?? 0);
      }
      if (results[2].status === 'fulfilled') {
        setBudgetCount(results[2].value.data.data?.totalCount ?? 0);
      }
      if (results[3].status === 'fulfilled') {
        setRecentTransactions(results[3].value.data.data?.items ?? []);
      }

      setIsLoading(false);
    };

    fetchAll();
  }, []);

  const balance = income - expense;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroPill}>Kişisel Finans</div>
          <h1 className={styles.heroTitle}>Finansal Durum</h1>
          <p className={styles.heroSub}>{getCurrentMonthLabel()}</p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroGlowOrb} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <>
            <div className={`${styles.kpiCard} ${styles.skeleton}`} style={{ height: 100 }} />
            <div className={`${styles.kpiCard} ${styles.skeleton}`} style={{ height: 100 }} />
            <div className={`${styles.kpiCard} ${styles.skeleton}`} style={{ height: 100 }} />
            <div className={`${styles.kpiCard} ${styles.skeleton}`} style={{ height: 100 }} />
          </>
        ) : (
          <>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Bu Ay Gelir</div>
              <div className={styles.kpiValue} style={{ color: '#10b981' }}>
                ₺ {formatAmount(income)}
              </div>
              <div className={styles.kpiBar} style={{ background: 'rgba(16,185,129,0.2)' }} />
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Bu Ay Gider</div>
              <div className={styles.kpiValue} style={{ color: '#ef4444' }}>
                ₺ {formatAmount(expense)}
              </div>
              <div className={styles.kpiBar} style={{ background: 'rgba(239,68,68,0.2)' }} />
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Bakiye</div>
              <div
                className={styles.kpiValue}
                style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}
              >
                ₺ {formatAmount(balance)}
              </div>
              <div className={styles.kpiBar} style={{ background: 'rgba(99,102,241,0.2)' }} />
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Aktif Bütçe</div>
              <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>
                {budgetCount}
              </div>
              <div className={styles.kpiBar} style={{ background: 'rgba(245,158,11,0.2)' }} />
            </div>
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Son İşlemler</h2>
          <button
            className={styles.seeAllBtn}
            onClick={() => navigate('/my-finance/transactions')}
          >
            İşlemlere Git <FaArrowRight />
          </button>
        </div>

        {isLoading ? (
          <div className={`${styles.skeleton}`} style={{ height: 200, borderRadius: 12 }} />
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
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      Henüz işlem bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.dateCell}>{formatDate(tx.date)}</td>
                      <td>{tx.description}</td>
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
                            background: tx.type === 1 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: tx.type === 1 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {tx.type === 1 ? 'Gelir' : 'Gider'}
                        </span>
                      </td>
                      <td
                        className={styles.amountCell}
                        style={{ color: tx.type === 1 ? '#10b981' : '#ef4444' }}
                      >
                        ₺ {formatAmount(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
