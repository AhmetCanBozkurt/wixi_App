import { useState } from 'react';
import { FaShip, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../shared/ui';
import s from './definitions.module.css';

interface PortItem extends Record<string, unknown> {
  id: string;
  unLocode: string;
  name: string;
  nameEn: string;
  countryCode: string;
  cityName: string;
  type: number;
  isTurkish: boolean;
  sortOrder: number;
  isActive: boolean;
}

const PORT_TYPE_OPTIONS = [
  { label: '— Seçiniz —', value: '' },
  { label: 'Deniz', value: '1' },
  { label: 'Hava', value: '2' },
  { label: 'Kara', value: '3' },
  { label: 'Demir', value: '4' },
  { label: 'Çok Modlu', value: '5' },
];

const PORT_TYPE_LABELS: Record<number, string> = {
  1: 'Deniz',
  2: 'Hava',
  3: 'Kara',
  4: 'Demir',
  5: 'Çok Modlu',
};

const initialForm = {
  unLocode: '',
  name: '',
  nameEn: '',
  countryCode: '',
  cityName: '',
  type: 1,
  isTurkish: false,
  sortOrder: 0,
  isActive: true,
};

export const PortsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PortItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: PortItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        unLocode: item.unLocode,
        name: item.name,
        nameEn: item.nameEn,
        countryCode: item.countryCode,
        cityName: item.cityName,
        type: item.type,
        isTurkish: item.isTurkish,
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
        await apiClient.put('ref/ports', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/ports', formData);
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
      await apiClient.delete(`ref/ports/${deleteId}`);
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
          <FaShip className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Liman Yönetimi</h1>
            <p className={s.pageSubtitle}>Deniz, hava ve kara limanlarını tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<PortItem>
          key={refreshKey}
          dataSource="ref/ports"
          columns={[
            { field: 'unLocode', title: 'UN LOCODE', width: 120 },
            { field: 'name', title: 'Ad' },
            { field: 'cityName', title: 'Şehir' },
            { field: 'countryCode', title: 'Ülke', width: 80 },
            {
              field: 'type',
              title: 'Tip',
              width: 120,
              template: (row) => (
                <Badge variant="info" size="sm">
                  {PORT_TYPE_LABELS[row.type as number] ?? String(row.type)}
                </Badge>
              ),
            },
            {
              field: 'isTurkish',
              title: 'Türkiye',
              width: 100,
              template: (row) => (
                <Badge variant={row.isTurkish ? 'success' : 'default'} size="sm">
                  {row.isTurkish ? 'Evet' : 'Hayır'}
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
          exportTitle="Liman_Listesi"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Limanı Düzenle' : 'Yeni Liman Ekle'}
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
            label="UN LOCODE"
            value={formData.unLocode}
            onChange={e => setFormData({ ...formData, unLocode: e.target.value })}
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
            label="Ülke Kodu"
            value={formData.countryCode}
            onChange={e => setFormData({ ...formData, countryCode: e.target.value.slice(0, 3) })}
          />
          <Input
            label="Şehir"
            value={formData.cityName}
            onChange={e => setFormData({ ...formData, cityName: e.target.value })}
          />
          <Select
            label="Tip"
            value={String(formData.type)}
            onChange={val => setFormData({ ...formData, type: Number(val) })}
            options={PORT_TYPE_OPTIONS}
          />
          <Switch
            label="Türkiye Limanı"
            checked={formData.isTurkish}
            onChange={e => setFormData({ ...formData, isTurkish: e.target.checked })}
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
