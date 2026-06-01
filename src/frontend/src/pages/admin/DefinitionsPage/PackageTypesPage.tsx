import { useState } from 'react';
import { FaBox, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch } from '../../../shared/ui';
import s from './definitions.module.css';

interface PackageTypeItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  symbol: string;
  isStackable: boolean;
  sortOrder: number;
  isActive: boolean;
}

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  symbol: '',
  isStackable: false,
  sortOrder: 0,
  isActive: true,
};

export const PackageTypesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PackageTypeItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: PackageTypeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        symbol: item.symbol,
        isStackable: item.isStackable,
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
        await apiClient.put('ref/package-types', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/package-types', formData);
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
      await apiClient.delete(`ref/package-types/${deleteId}`);
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
          <FaBox className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Paket Türü Yönetimi</h1>
            <p className={s.pageSubtitle}>Yük ambalaj ve paket türlerini tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<PackageTypeItem>
          key={refreshKey}
          dataSource="ref/package-types"
          columns={[
            { field: 'code', title: 'Kod', width: 80 },
            { field: 'name', title: 'Ad' },
            { field: 'nameEn', title: 'İng.Ad' },
            { field: 'symbol', title: 'Sembol', width: 80 },
            {
              field: 'isStackable',
              title: 'İstifleme',
              width: 110,
              template: (row) => (
                <Badge variant={row.isStackable ? 'success' : 'default'} size="sm">
                  {row.isStackable ? 'Evet' : 'Hayır'}
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
          exportTitle="Paket_Turu_Listesi"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Paket Türünü Düzenle' : 'Yeni Paket Türü Ekle'}
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
            label="Sembol"
            value={formData.symbol}
            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
          />
          <Switch
            label="İstiflenebilir"
            checked={formData.isStackable}
            onChange={e => setFormData({ ...formData, isStackable: e.target.checked })}
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
