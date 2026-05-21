import { useState } from 'react';
import { FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../shared/ui';
import s from './definitions.module.css';

interface PaymentTermItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  dueDays: number;
  type: number;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const PAYMENT_TYPE_OPTIONS = [
  { label: '— Seçiniz —', value: '' },
  { label: 'Peşin', value: '1' },
  { label: 'Net Vadeli', value: '2' },
  { label: 'Akreditif', value: '3' },
  { label: 'Vesaik Mukabili', value: '4' },
];

const PAYMENT_TYPE_LABELS: Record<number, string> = {
  1: 'Peşin',
  2: 'Net',
  3: 'Akreditif',
  4: 'Vesaik',
};

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  dueDays: 0,
  type: 1,
  description: '',
  sortOrder: 0,
  isActive: true,
};

export const PaymentTermsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PaymentTermItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: PaymentTermItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        dueDays: item.dueDays,
        type: item.type,
        description: item.description,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({ ...initialForm });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await apiClient.put('ref/payment-terms', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/payment-terms', formData);
        toast.success('Kayıt eklendi');
      }
      closeModal();
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`ref/payment-terms/${deleteId}`);
      toast.success('Kayıt silindi');
      setDeleteId(null);
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('Silinemedi');
    }
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.titleArea}>
          <FaFileInvoiceDollar className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Vade Yönetimi</h1>
            <p className={s.pageSubtitle}>Ödeme vadelerini ve koşullarını tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<PaymentTermItem>
          key={refreshKey}
          dataSource="ref/payment-terms"
          columns={[
            { field: 'code', title: 'Kod', width: 100 },
            { field: 'name', title: 'Ad' },
            { field: 'nameEn', title: 'İng.Ad' },
            { field: 'dueDays', title: 'Vade Günü', width: 100 },
            {
              field: 'type',
              title: 'Tip',
              width: 130,
              template: (row) => (
                <Badge variant="info" size="sm">
                  {PAYMENT_TYPE_LABELS[row.type as number] ?? String(row.type)}
                </Badge>
              ),
            },
            {
              field: 'isActive',
              title: 'Durum',
              width: 120,
              template: (row) => (
                <Badge variant={row.isActive ? 'success' : 'danger'} size="sm" showDot>
                  {row.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              ),
            },
          ]}
          sortable
          groupable
          selectable
          reorderable
          resizable
          pageable={{ pageSize: 15 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Vade_Listesi"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Vadeyi Düzenle' : 'Yeni Vade Ekle'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Kod"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Ad"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="İngilizce Ad"
            value={formData.nameEn}
            onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
          />
          <Input
            label="Vade Günü"
            type="number"
            value={String(formData.dueDays)}
            onChange={e => setFormData({ ...formData, dueDays: Number(e.target.value) })}
          />
          <Select
            label="Tip"
            value={String(formData.type)}
            onChange={val => setFormData({ ...formData, type: Number(val) })}
            options={PAYMENT_TYPE_OPTIONS}
          />
          <Input
            label="Açıklama"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <Switch
            label="Aktif"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Kaydı Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={handleDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu kaydı silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
};
