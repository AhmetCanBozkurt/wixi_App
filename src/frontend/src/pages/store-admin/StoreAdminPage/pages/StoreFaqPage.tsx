import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaQuestionCircle, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AdvancedDataTable } from '../../../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { apiClient } from '../../../../shared/api/axiosConfig';
import s from './storeAdmin.shared.module.css';

interface FaqItemDto extends Record<string, unknown> {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FaqFormData = {
  question: '',
  answer: '',
  category: '',
  sortOrder: 0,
  isActive: true,
};

export const StoreFaqPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [items, setItems] = useState<FaqItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FaqFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ items: FaqItemDto[] }>('/store-admin/faq');
      setItems(res.data.items ?? []);
    } catch {
      toast.error('SSS yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setIsModalOpen(true); };

  const openEdit = (item: FaqItemDto) => {
    setEditingId(item.id);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category ?? '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); };

  const handleSave = async () => {
    if (!formData.question.trim()) { toast.error('Soru zorunludur.'); return; }
    if (!formData.answer.trim()) { toast.error('Cevap zorunludur.'); return; }
    setIsSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim() || null,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };
      if (editingId) {
        await apiClient.put(`/store-admin/faq/${editingId}`, { id: editingId, ...payload });
        toast.success('SSS güncellendi.');
      } else {
        await apiClient.post('/store-admin/faq', payload);
        toast.success('SSS oluşturuldu.');
      }
      closeModal();
      void fetchItems();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/store-admin/faq/${id}`);
      toast.success('SSS silindi.');
      setConfirmDeleteId(null);
      void fetchItems();
    } catch {
      toast.error('SSS silinemedi.');
    }
  };

  const setField = <K extends keyof FaqFormData>(key: K, value: FaqFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const columns: ColumnConfig<FaqItemDto>[] = useMemo(() => [
    {
      field: 'question',
      title: 'Soru',
      width: 350,
      template: (row) => (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
          {row.question.length > 90 ? `${row.question.slice(0, 90)}…` : row.question}
        </span>
      ),
    },
    {
      field: 'category',
      title: 'Kategori',
      width: 140,
      template: (row) => row.category ? (
        <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600 }}>
          {row.category}
        </span>
      ) : <span className={s.muted}>—</span>,
    },
    {
      field: 'sortOrder',
      title: 'Sıra',
      width: 80,
      template: (row) => <span className={s.muted}>{row.sortOrder}</span>,
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
  ], []);

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaQuestionCircle className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Sık Sorulan Sorular</h2>
            <p className={s.pageSubtitle}>SSS içeriklerini yönetin</p>
          </div>
        </div>
        <button type="button" className={s.addButton} onClick={openCreate}>
          <FaPlus />
          Yeni SSS
        </button>
      </div>

      <AdvancedDataTable<FaqItemDto>
        dataSource={isLoading ? [] : items}
        columns={columns}
        pageable={{ pageSize: 20 }}
        toolbar={['search', 'excel']}
        filterable
        onEdit={(row) => openEdit(row)}
        onDelete={(row) => setConfirmDeleteId(row.id)}
      />

      {isModalOpen && (
        <div className={s.modalOverlay} onClick={closeModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <FaQuestionCircle />
                {editingId ? 'SSS Düzenle' : 'Yeni SSS'}
              </h3>
              <button type="button" className={s.modalClose} onClick={closeModal}><FaTimes /></button>
            </div>

            <div className={s.modalBody}>
              <div className={s.formRow}>
                <label className={s.label}>Soru *</label>
                <input
                  type="text"
                  className={s.input}
                  value={formData.question}
                  onChange={(e) => setField('question', e.target.value)}
                  placeholder="Müşterilerin sıkça sorduğu soru"
                />
              </div>

              <div className={s.formRow}>
                <label className={s.label}>Cevap *</label>
                <textarea
                  className={s.textarea}
                  value={formData.answer}
                  onChange={(e) => setField('answer', e.target.value)}
                  placeholder="Sorunun cevabı..."
                  rows={5}
                />
              </div>

              <div className={s.formGrid}>
                <div className={s.formRow}>
                  <label className={s.label}>Kategori</label>
                  <input
                    type="text"
                    className={s.input}
                    value={formData.category}
                    onChange={(e) => setField('category', e.target.value)}
                    placeholder="Ör: Kargo, Ödeme, İptal"
                  />
                </div>
                <div className={s.formRow}>
                  <label className={s.label}>Sıra</label>
                  <input
                    type="number"
                    className={s.input}
                    value={formData.sortOrder}
                    onChange={(e) => setField('sortOrder', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              <label className={s.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                />
                Aktif
              </label>
            </div>

            <div className={s.modalFooter}>
              <button type="button" className={s.cancelBtn} onClick={closeModal}>İptal</button>
              <button type="button" className={s.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!!confirmDeleteId && (
        <div className={s.modalOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={s.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.confirmIcon}>🗑️</div>
            <h3 className={s.confirmTitle}>SSS Sil</h3>
            <p className={s.confirmText}>Bu SSS maddesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className={s.confirmActions}>
              <button type="button" className={s.cancelBtn} onClick={() => setConfirmDeleteId(null)}>Vazgeç</button>
              <button type="button" className={s.deleteConfirmBtn} onClick={() => void handleDelete(confirmDeleteId)}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
