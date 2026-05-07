import { useState, useEffect, useCallback } from 'react';
import { FaTags, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Button, Modal, Input, Select } from '../../shared/ui';
import { TenantSelector } from '../../features/TenantSelector/TenantSelector';

interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parentName?: string;
  sortOrder: number;
  isActive: boolean;
}

export const ECommerceCategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    sortOrder: 0
  });

  const [activeTenant, setActiveTenant] = useState(() => localStorage.getItem('wixi-active-tenant') || '');

  const fetchCategories = useCallback(async () => {
    if (!activeTenant) {
      setCategories([]);
      return;
    }
    try {
      const res = await apiClient.get<{ items?: CategoryDto[] } | CategoryDto[]>('admin/ecommerce/categories');
      const data = (res.data as { items?: CategoryDto[] })?.items || (Array.isArray(res.data) ? res.data : []);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Kategori listesi hatası:", err);
      toast.error('Kategori listesi alınamadı.');
    }
  }, [activeTenant]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = async (category: CategoryDto) => {
    const result = await Swal.fire({
      title: 'Silmek istiyor musunuz?',
      text: `${category.name} silinecektir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-danger)',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      background: 'var(--surface)',
      color: 'var(--text-main)'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`admin/ecommerce/categories/${category.id}`);
        toast.success('Kategori başarıyla silindi.');
        fetchCategories();
      } catch (err) {
        console.error("Kategori silme hatası:", err);
        toast.error('Silme işlemi başarısız.');
      }
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <FaTags style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Kategoriler</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Ürün kategorilerini yönetin.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <TenantSelector onTenantChange={setActiveTenant} />
          <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<FaPlus />} disabled={!activeTenant}>
            Yeni Kategori
          </Button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Kategori Ekle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input 
            label="Kategori Adı" 
            value={formData.name} 
            onChange={e => {
              const val = e.target.value;
              setFormData({...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-')});
            }}
            placeholder="Örn: Elektronik"
            required
          />
          <Input 
            label="Kategori Adresi (Slug)" 
            value={formData.slug} 
            onChange={e => setFormData({...formData, slug: e.target.value})}
            placeholder="Örn: elektronik"
            required
          />
          <Select 
            label="Üst Kategori"
            value={formData.parentId}
            onChange={val => setFormData({...formData, parentId: val as string})}
            options={[
              { value: '', label: 'Ana Kategori' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
          <Input 
            label="Sıralama" 
            type="number"
            value={formData.sortOrder} 
            onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button variant="primary" onClick={async () => {
               if (!formData.name || !formData.slug) return toast.error('Ad ve Slug gereklidir.');
               try {
                 const payload = { ...formData, parentId: formData.parentId || null };
                 await apiClient.post('admin/ecommerce/categories', payload);
                 toast.success('Kategori eklendi.');
                 setIsModalOpen(false);
                 setFormData({ name: '', slug: '', parentId: '', sortOrder: 0 });
                 fetchCategories();
               } catch { toast.error('Hata oluştu.'); }
            }}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      {!activeTenant && (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-main)' }}>Lütfen bir mağaza seçin</h3>
          <p style={{ color: 'var(--text-muted)' }}>Kategorileri görüntülemek veya yönetmek için sağ üstteki menüden bir mağaza seçmelisiniz.</p>
        </div>
      )}

      {activeTenant && (
      <div style={{ background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
        <AdvancedDataTable<CategoryDto>
          dataSource={categories}
          columns={[
            { field: 'name', title: 'Kategori Adı', template: (row) => <strong>{row.name}</strong> },
            { field: 'slug', title: 'Slug' },
            { field: 'parentName', title: 'Üst Kategori', template: (row) => row.parentName || '-' },
            { field: 'sortOrder', title: 'Sıra', width: 80 },
            { 
              field: 'isActive', 
              title: 'Durum',
              width: 120,
              template: (row) => (
                <Badge variant={row.isActive ? 'success' : 'danger'} size="sm">
                  {row.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              )
            }
          ]}
          pageable={{ pageSize: 10 }}
          onDelete={handleDeleteCategory}
        />
      </div>
      )}
    </div>
  );
};
