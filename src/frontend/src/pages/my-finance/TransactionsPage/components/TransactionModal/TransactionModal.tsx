import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { Modal } from '../../../../../shared/ui/Modal/Modal';
import { Button } from '../../../../../shared/ui/Button/Button';
import { Input } from '../../../../../shared/ui/Input/Input';
import { Select } from '../../../../../shared/ui/Select/Select';
import { Switch } from '../../../../../shared/ui/Switch/Switch';
import apiClient from '../../../../../shared/api/axiosConfig';
import styles from './TransactionModal.module.css';

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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editItem?: TransactionItem | null;
  categories: CategoryItem[];
}

interface ErrorResponseData {
  message?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// POST/PUT body → enum string values (JsonStringEnumConverter)
const TYPE_OPTIONS = [
  { label: 'Gider', value: 'Expense' },
  { label: 'Gelir', value: 'Income' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const TransactionModal = ({
  isOpen,
  onClose,
  onSaved,
  editItem,
  categories,
}: TransactionModalProps) => {
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<string>('Expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && editItem) {
      setCategoryId(editItem.categoryId ?? '');
      setType(editItem.type); // API returns string enum
      setAmount(String(editItem.amount));
      setDescription(editItem.description ?? '');
      setDate(editItem.date ? editItem.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setIsInstallment(editItem.isInstallment ?? false);
      setError('');
    } else if (isOpen && !editItem) {
      setCategoryId('');
      setType('Expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsInstallment(false);
      setError('');
    }
  }, [isOpen, editItem]);

  const categoryOptions = [
    { label: '— Seçiniz —', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const handleSave = async () => {
    setError('');
    if (!categoryId) { setError('Lütfen kategori seçiniz.'); return; }
    if (!amount || Number(amount) <= 0) { setError('Geçerli bir tutar giriniz.'); return; }
    if (!description.trim()) { setError('Açıklama zorunludur.'); return; }
    if (!date) { setError('Tarih zorunludur.'); return; }

    setIsSaving(true);
    try {
      if (editItem) {
        await apiClient.put(`/me/finance/transactions/${editItem.id}`, {
          categoryId,
          type, // string enum: "Income" | "Expense"
          amount: Number(amount),
          description,
          date,
        });
      } else {
        await apiClient.post('/me/finance/transactions', {
          categoryId,
          type, // string enum: "Income" | "Expense"
          amount: Number(amount),
          description,
          date,
          isInstallment,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponseData>;
      setError(axiosErr.response?.data?.message ?? 'Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'İşlemi Düzenle' : 'Yeni İşlem'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
            {editItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Select
          label="Tür"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => setType(String(v))}
          required
        />
        <Select
          label="Kategori"
          options={categoryOptions}
          value={categoryId}
          onChange={(v) => setCategoryId(String(v))}
          required
        />
        <Input
          label="Tutar (₺)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
        />
        <Input
          label="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          label="Tarih"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        {!editItem && (
          <Switch
            label="Taksitli İşlem"
            checked={isInstallment}
            onChange={(e) => setIsInstallment(e.target.checked)}
          />
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </Modal>
  );
};
