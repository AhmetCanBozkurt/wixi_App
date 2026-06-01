import { useState } from 'react';
import { FaTags, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch } from '../../../shared/ui';
import s from './definitions.module.css';

interface ServiceCategoryItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  description: string;
  colorHex: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  description: '',
  colorHex: '#6c757d',
  icon: '',
  sortOrder: 0,
  isActive: true,
};

export const ServiceCategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ServiceCategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: ServiceCategoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        description: item.description,
        colorHex: item.colorHex || '#6c757d',
        icon: item.icon,
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
        await apiClient.put('ref/service-categories', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/service-categories', formData);
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
      await apiClient.delete(`ref/service-categories/${deleteId}`);
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
          <FaTags className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Hizmet Kategorileri</h1>
            <p className={s.pageSubtitle}>Navlun, gümrük, sigorta gibi hizmet kategorilerini tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<ServiceCategoryItem>
          key={refreshKey}
          dataSource="ref/service-categories"
          columns={[
            { field: 'code', title: 'Kod', width: 100 },
            { field: 'name', title: 'Ad' },
            { field: 'nameEn', title: 'İngilizce' },
            {
              field: 'colorHex',
              title: 'Renk',
              width: 80,
              template: (row) => (
                <div style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: row.colorHex as string || '#ccc', border: '1px solid rgba(0,0,0,.15)' }} />
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
          exportTitle="Hizmet_Kategorileri"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Hizmet Kategorisi Düzenle' : 'Yeni Hizmet Kategorisi Ekle'}
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
            label="Açıklama"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="İkon (ör: FaTruck)"
            value={formData.icon}
            onChange={e => setFormData({ ...formData, icon: e.target.value })}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Renk</label>
            <input
              type="color"
              value={formData.colorHex}
              onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
              style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
            />
            <Input
              label=""
              value={formData.colorHex}
              onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
            />
          </div>
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
