import { useState } from 'react';
import { FaGlobeAmericas, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../../shared/ui';
import s from './definitions.module.css';

interface IncotermItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  group: number;
  sellerPaysFreight: boolean;
  sellerPaysInsurance: boolean;
  sortOrder: number;
  isActive: boolean;
}

const INCOTERM_GROUP_OPTIONS = [
  { label: '— Seçiniz —', value: '' },
  { label: 'Tüm Taşıma Modları', value: '1' },
  { label: 'Deniz ve İç Su', value: '2' },
];

const INCOTERM_GROUP_LABELS: Record<number, string> = {
  1: 'Tüm Modlar',
  2: 'Deniz/İç Su',
};

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  group: 1,
  sellerPaysFreight: false,
  sellerPaysInsurance: false,
  sortOrder: 0,
  isActive: true,
};

export const IncotermsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<IncotermItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: IncotermItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        group: item.group,
        sellerPaysFreight: item.sellerPaysFreight,
        sellerPaysInsurance: item.sellerPaysInsurance,
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
        await apiClient.put('ref/incoterms', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/incoterms', formData);
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
      await apiClient.delete(`ref/incoterms/${deleteId}`);
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
          <FaGlobeAmericas className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Incoterms Yönetimi</h1>
            <p className={s.pageSubtitle}>ICC 2020 Uluslararası Ticaret Terimleri.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<IncotermItem>
          key={refreshKey}
          dataSource="ref/incoterms"
          columns={[
            { field: 'code', title: 'Kod', width: 80 },
            { field: 'name', title: 'Ad' },
            { field: 'nameEn', title: 'İngilizce' },
            {
              field: 'group',
              title: 'Grup',
              width: 140,
              template: (row) => (
                <Badge variant="info" size="sm">
                  {INCOTERM_GROUP_LABELS[row.group as number] ?? String(row.group)}
                </Badge>
              ),
            },
            {
              field: 'sellerPaysFreight',
              title: 'Navlun',
              width: 100,
              template: (row) => (
                <Badge variant={row.sellerPaysFreight ? 'success' : 'default'} size="sm">
                  {row.sellerPaysFreight ? 'Evet' : 'Hayır'}
                </Badge>
              ),
            },
            {
              field: 'sellerPaysInsurance',
              title: 'Sigorta',
              width: 100,
              template: (row) => (
                <Badge variant={row.sellerPaysInsurance ? 'success' : 'default'} size="sm">
                  {row.sellerPaysInsurance ? 'Evet' : 'Hayır'}
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
          exportTitle="Incoterms_Listesi"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Incoterm Düzenle' : 'Yeni Incoterm Ekle'}
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
          <Select
            label="Grup"
            value={String(formData.group)}
            onChange={val => setFormData({ ...formData, group: Number(val) })}
            options={INCOTERM_GROUP_OPTIONS}
          />
          <Input
            label="Açıklama (TR)"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Açıklama (EN)"
            value={formData.descriptionEn}
            onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
          />
          <Switch
            label="Satıcı Navlun Öder"
            checked={formData.sellerPaysFreight}
            onChange={e => setFormData({ ...formData, sellerPaysFreight: e.target.checked })}
          />
          <Switch
            label="Satıcı Sigorta Öder"
            checked={formData.sellerPaysInsurance}
            onChange={e => setFormData({ ...formData, sellerPaysInsurance: e.target.checked })}
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
