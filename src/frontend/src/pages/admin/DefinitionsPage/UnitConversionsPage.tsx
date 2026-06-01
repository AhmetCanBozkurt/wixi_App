import { useState, useEffect } from 'react';
import { FaExchangeAlt, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../../shared/ui';
import s from './definitions.module.css';

interface UnitConversionItem extends Record<string, unknown> {
  id: string;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitSymbol: string;
  toUnitId: string;
  toUnitName: string;
  toUnitSymbol: string;
  factor: number;
  sortOrder: number;
  isActive: boolean;
}

interface UnitOption {
  label: string;
  value: string;
}

const initialForm = {
  fromUnitId: '',
  toUnitId: '',
  factor: 1,
  sortOrder: 0,
  isActive: true,
};

export const UnitConversionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<UnitConversionItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([{ label: '— Seçiniz —', value: '' }]);

  useEffect(() => {
    apiClient.get('ref/units').then(res => {
      const items = res.data?.items ?? [];
      setUnitOptions([
        { label: '— Seçiniz —', value: '' },
        ...items.map((u: { id: string; name: string; symbol?: string }) => ({
          label: u.symbol ? `${u.name} (${u.symbol})` : u.name,
          value: u.id,
        })),
      ]);
    }).catch(() => {});
  }, []);

  const openModal = (item?: UnitConversionItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        fromUnitId: item.fromUnitId,
        toUnitId: item.toUnitId,
        factor: item.factor,
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
        await apiClient.put('ref/unit-conversions', { id: editingItem.id, ...formData });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/unit-conversions', formData);
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
      await apiClient.delete(`ref/unit-conversions/${deleteId}`);
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
          <FaExchangeAlt className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>Birim Dönüşümleri</h1>
            <p className={s.pageSubtitle}>Birimler arası dönüşüm katsayılarını tanımlayın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<UnitConversionItem>
          key={refreshKey}
          dataSource="ref/unit-conversions"
          columns={[
            { field: 'fromUnitName', title: 'Kaynak Birim' },
            { field: 'fromUnitSymbol', title: 'Sembol', width: 80 },
            { field: 'toUnitName', title: 'Hedef Birim' },
            { field: 'toUnitSymbol', title: 'Sembol', width: 80 },
            { field: 'factor', title: 'Katsayı', width: 120 },
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
          exportTitle="Birim_Donusumleri"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Dönüşümü Düzenle' : 'Yeni Dönüşüm Ekle'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSave}>Kaydet</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select
            label="Kaynak Birim"
            value={formData.fromUnitId}
            onChange={val => setFormData({ ...formData, fromUnitId: String(val) })}
            options={unitOptions}
          />
          <Select
            label="Hedef Birim"
            value={formData.toUnitId}
            onChange={val => setFormData({ ...formData, toUnitId: String(val) })}
            options={unitOptions}
          />
          <Input
            label="Katsayı (1 Kaynak = ? Hedef)"
            type="number"
            value={String(formData.factor)}
            onChange={e => setFormData({ ...formData, factor: Number(e.target.value) })}
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
