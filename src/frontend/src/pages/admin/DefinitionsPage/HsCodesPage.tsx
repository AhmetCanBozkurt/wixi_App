import { useState, useEffect } from 'react';
import { FaBarcode, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Input, Button, Modal, Switch, Select } from '../../../shared/ui';
import s from './definitions.module.css';

interface HsCodeItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  level: number;
  parentId: string | null;
  parentCode: string;
  sortOrder: number;
  isActive: boolean;
}

interface ParentOption {
  label: string;
  value: string;
}

const HS_LEVEL_OPTIONS = [
  { label: '— Seçiniz —', value: '' },
  { label: 'Bölüm (Section)', value: '1' },
  { label: 'Fasıl (Chapter)', value: '2' },
  { label: 'Pozisyon (Heading)', value: '3' },
  { label: 'Alt Pozisyon (Subheading)', value: '4' },
];

const HS_LEVEL_LABELS: Record<number, string> = {
  1: 'Bölüm',
  2: 'Fasıl',
  3: 'Pozisyon',
  4: 'Alt Pozisyon',
};

const HS_LEVEL_VARIANTS: Record<number, 'info' | 'success' | 'warning' | 'default'> = {
  1: 'info',
  2: 'success',
  3: 'warning',
  4: 'default',
};

const initialForm = {
  code: '',
  name: '',
  nameEn: '',
  level: '1' as string,
  parentId: '' as string,
  sortOrder: 0,
  isActive: true,
};

export const HsCodesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<HsCodeItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...initialForm });
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([{ label: '— Yok (Kök) —', value: '' }]);

  useEffect(() => {
    apiClient.get('ref/hs-codes').then(res => {
      const items = res.data?.items ?? [];
      setParentOptions([
        { label: '— Yok (Kök) —', value: '' },
        ...items.map((h: { id: string; code: string; name: string; level: number }) => ({
          label: `[${HS_LEVEL_LABELS[h.level] ?? h.level}] ${h.code} — ${h.name}`,
          value: h.id,
        })),
      ]);
    }).catch(() => {});
  }, [refreshKey]);

  const openModal = (item?: HsCodeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        nameEn: item.nameEn,
        level: String(item.level),
        parentId: item.parentId ?? '',
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
        level: Number(formData.level),
        parentId: formData.parentId || null,
      };
      if (editingItem) {
        await apiClient.put('ref/hs-codes', { id: editingItem.id, ...payload });
        toast.success('Kayıt güncellendi');
      } else {
        await apiClient.post('ref/hs-codes', payload);
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
      await apiClient.delete(`ref/hs-codes/${deleteId}`);
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
          <FaBarcode className={s.mainIcon} />
          <div>
            <h1 className={s.pageTitle}>GTİP / HS Kodları</h1>
            <p className={s.pageSubtitle}>Harmonize sistem tarife kodlarını hiyerarşik olarak yönetin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          <FaPlus style={{ marginRight: 8 }} /> Yeni Ekle
        </Button>
      </div>

      <div className={s.content}>
        <AdvancedDataTable<HsCodeItem>
          key={refreshKey}
          dataSource="ref/hs-codes"
          columns={[
            { field: 'code', title: 'Kod', width: 120 },
            { field: 'name', title: 'Ad' },
            { field: 'parentCode', title: 'Üst Kod', width: 110 },
            {
              field: 'level',
              title: 'Seviye',
              width: 140,
              template: (row) => (
                <Badge variant={HS_LEVEL_VARIANTS[row.level as number] ?? 'default'} size="sm">
                  {HS_LEVEL_LABELS[row.level as number] ?? String(row.level)}
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
          exportTitle="GTIP_HS_Kodlari"
          onEdit={(item) => openModal(item)}
          onDelete={(item) => setDeleteId(item.id as string)}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'HS Kodu Düzenle' : 'Yeni HS Kodu Ekle'}
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
            label="Kod (ör: 01, 0101, 010110)"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
          <Input
            label="Ad (TR)"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Ad (EN)"
            value={formData.nameEn}
            onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
          />
          <Select
            label="Seviye"
            value={formData.level}
            onChange={val => setFormData({ ...formData, level: String(val) })}
            options={HS_LEVEL_OPTIONS}
          />
          <Select
            label="Üst Kayıt"
            value={formData.parentId}
            onChange={val => setFormData({ ...formData, parentId: String(val) })}
            options={parentOptions}
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
