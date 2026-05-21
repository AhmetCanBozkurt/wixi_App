import { useState, useEffect } from 'react';
import { FaRulerCombined, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../../shared/ui';
import s from './definitions.module.css';

interface UnitItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  symbol: string;
  unitCategoryId: string | null;
  categoryName: string;
  isBaseUnit: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryOption {
  label: string;
  value: string;
}

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  symbol: '',
  unitCategoryId: '' as string,
  isBaseUnit: false,
  sortOrder: 0,
  isActive: true,
};

export const UnitsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<UnitItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([{ label: '— Seçiniz —', value: '' }]);

  useEffect(() => {
    apiClient.get('ref/unit-categories').then(res => {
      const items = res.data?.items ?? [];
      setCategoryOptions([
        { label: '— Seçiniz —', value: '' },
        ...items.map((c: { id: string; name: string }) => ({ label: c.name, value: c.id })),
      ]);
    }).catch(() => {});
  }, []);

  const openModal = (item?: UnitItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        symbol: item.symbol,
        unitCategoryId: item.unitCategoryId ?? '',
        isBaseUnit: item.isBaseUnit,
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
      const payload = {
        ...formData,
        unitCategoryId: formData.unitCategoryId || null,
      };
      if (editingItem) {
        await apiClient.put('ref/units', { id: editingItem.id, ...payload });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/units', payload);
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
      await apiClient.delete(`ref/units/${deleteId}`);
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
          <FaRulerCombined className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Birim Yönetimi</h1>
            <p className={s.pageSubtitle}>Ölçüm birimlerini kategorilere göre tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<UnitItem>
          key={refreshKey}
          dataSource="ref/units"
          columns={[
            { field: 'code', title: 'Kod', width: 100 },
            { field: 'name', title: 'Ad' },
            { field: 'symbol', title: 'Sembol', width: 80 },
            { field: 'categoryName', title: 'Kategori', width: 150 },
            {
              field: 'isBaseUnit',
              title: 'Taban',
              width: 90,
              template: (row) => (
                <Badge variant={row.isBaseUnit ? 'success' : 'default'} size="sm">
                  {row.isBaseUnit ? 'Evet' : 'Hayır'}
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
          exportTitle="Birimler"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Birimi Düzenle' : 'Yeni Birim Ekle'}
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
            label="Sembol (ör: kg, m²)"
            value={formData.symbol}
            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
          />
          <Select
            label="Kategori"
            value={formData.unitCategoryId}
            onChange={val => setFormData({ ...formData, unitCategoryId: String(val) })}
            options={categoryOptions}
          />
          <Switch
            label="Taban Birim"
            checked={formData.isBaseUnit}
            onChange={e => setFormData({ ...formData, isBaseUnit: e.target.checked })}
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
