import { useState } from 'react';
import { FaTruck, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch } from '../../../shared/ui';
import s from './definitions.module.css';

interface TransportModeItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  icon: string;
  colorHex: string;
  sortOrder: number;
  isActive: boolean;
}

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  icon: '',
  colorHex: '#3B82F6',
  sortOrder: 0,
  isActive: true,
};

export const TransportModesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TransportModeItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: TransportModeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        icon: item.icon,
        colorHex: item.colorHex || '#3B82F6',
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
        await apiClient.put('ref/transport-modes', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/transport-modes', formData);
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
      await apiClient.delete(`ref/transport-modes/${deleteId}`);
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
          <FaTruck className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Taşıma Modu Yönetimi</h1>
            <p className={s.pageSubtitle}>Hava, deniz, kara, demir ve kurye modlarını yönetin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<TransportModeItem>
          key={refreshKey}
          dataSource="ref/transport-modes"
          columns={[
            {
              field: 'colorHex',
              title: 'Renk',
              width: 70,
              template: (row) => (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: (row.colorHex as string) || '#999',
                    display: 'inline-block',
                  }}
                />
              ),
            },
            { field: 'code', title: 'Kod', width: 80 },
            { field: 'name', title: 'Ad' },
            { field: 'nameEn', title: 'İngilizce' },
            { field: 'icon', title: 'Icon' },
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
          exportTitle="Tasima_Modu_Listesi"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Taşıma Modunu Düzenle' : 'Yeni Taşıma Modu Ekle'}
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
            label="Icon"
            placeholder="plane, ship, truck, train-front"
            value={formData.icon}
            onChange={e => setFormData({ ...formData, icon: e.target.value })}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Renk
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={formData.colorHex}
                onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
                style={{ width: 48, height: 36, border: '1px solid var(--border-glass)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
              />
              <Input
                placeholder="#3B82F6"
                value={formData.colorHex}
                onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
              />
            </div>
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
