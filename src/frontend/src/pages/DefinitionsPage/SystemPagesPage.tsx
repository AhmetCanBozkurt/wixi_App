import { useState } from 'react';
import { FaSitemap, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch } from '../../shared/ui';
import s from './definitions.module.css';

interface SystemPageItem extends Record<string, unknown> {
  id: string;
  path: string;
  name: string;
  group: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const initialForm = {
  path: '',
  name: '',
  group: '',
  icon: '',
  sortOrder: 0,
  isActive: true,
};

export const SystemPagesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<SystemPageItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });

  const openModal = (item?: SystemPageItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        path: item.path,
        name: item.name,
        group: item.group,
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
        await apiClient.put('ref/system-pages', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/system-pages', formData);
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
      await apiClient.delete(`ref/system-pages/${deleteId}`);
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
          <FaSitemap className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Sistem Sayfa Yönetimi</h1>
            <p className={s.pageSubtitle}>Menü builder'da görünecek admin route'larını buradan yönetin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<SystemPageItem>
          key={refreshKey}
          dataSource="ref/system-pages"
          columns={[
            { field: 'name', title: 'Ad' },
            {
              field: 'path',
              title: 'Yol (Path)',
              template: (row) => <code style={{ fontSize: '0.82rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{row.path as string}</code>,
            },
            {
              field: 'group',
              title: 'Grup',
              width: 160,
              template: (row) => (
                <Badge variant="info" size="sm">
                  {row.group as string}
                </Badge>
              ),
            },
            { field: 'icon', title: 'İkon', width: 120 },
            { field: 'sortOrder', title: 'SortOrder', width: 100 },
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
          exportTitle="Sistem_Sayfalar"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Sistem Sayfasını Düzenle' : 'Yeni Sistem Sayfası Ekle'}
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
            label="Yol (Path)"
            placeholder="/admin/xxx"
            value={formData.path}
            onChange={e => setFormData({ ...formData, path: e.target.value })}
          />
          <Input
            label="Ad"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Grup"
            placeholder="Tanımlamalar, Sistem, Finans..."
            value={formData.group}
            onChange={e => setFormData({ ...formData, group: e.target.value })}
          />
          <Input
            label="İkon"
            placeholder="FaMap, FaShip..."
            value={formData.icon}
            onChange={e => setFormData({ ...formData, icon: e.target.value })}
          />
          <Input
            label="Sıra"
            type="number"
            value={String(formData.sortOrder)}
            onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
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
