import { useState, useEffect, useCallback } from 'react';
import { FaBuilding, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Button, Modal, Input } from '../../shared/ui';
import { TenantSelector } from '../../features/TenantSelector/TenantSelector';

interface BrandDto extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
}

export const ECommerceBrandsPage = () => {
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    websiteUrl: '',
    logoUrl: ''
  });

  const [activeTenant, setActiveTenant] = useState(() => localStorage.getItem('wixi-active-tenant') || '');

  const fetchBrands = useCallback(async () => {
    if (!activeTenant) {
      setBrands([]);
      return;
    }
    try {
      const res = await apiClient.get<{ items?: BrandDto[] } | BrandDto[]>('admin/ecommerce/brands');
      const data = (res.data as { items?: BrandDto[] })?.items || (Array.isArray(res.data) ? res.data : []);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Marka listesi hatası:", err);
      toast.error('Marka listesi alınamadı.');
    }
  }, [activeTenant]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDeleteBrand = async (brand: BrandDto) => {
    const result = await Swal.fire({
      title: 'Silmek istiyor musunuz?',
      text: `${brand.name} silinecektir.`,
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
        await apiClient.delete(`admin/ecommerce/brands/${brand.id}`);
        toast.success('Marka başarıyla silindi.');
        fetchBrands();
      } catch (err) {
        console.error("Marka silme hatası:", err);
        toast.error('Silme işlemi başarısız.');
      }
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <FaBuilding style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Markalar</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Ürün markalarını yönetin.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <TenantSelector onTenantChange={setActiveTenant} />
          <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<FaPlus />} disabled={!activeTenant}>
            Yeni Marka
          </Button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Marka Ekle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input 
            label="Marka Adı" 
            value={formData.name} 
            onChange={e => {
              const val = e.target.value;
              setFormData({...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-')});
            }}
            placeholder="Örn: Wixi"
            required
          />
          <Input 
            label="Marka Adresi (Slug)" 
            value={formData.slug} 
            onChange={e => setFormData({...formData, slug: e.target.value})}
            placeholder="Örn: wixi"
            required
          />
          <Input 
            label="Web Sitesi" 
            value={formData.websiteUrl} 
            onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
            placeholder="https://..."
          />
          <Input 
            label="Logo URL" 
            value={formData.logoUrl} 
            onChange={e => setFormData({...formData, logoUrl: e.target.value})}
            placeholder="https://.../logo.png"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button variant="primary" onClick={async () => {
               if (!formData.name || !formData.slug) return toast.error('Ad ve Slug gereklidir.');
               try {
                 await apiClient.post('admin/ecommerce/brands', formData);
                 toast.success('Marka eklendi.');
                 setIsModalOpen(false);
                 setFormData({ name: '', slug: '', description: '', websiteUrl: '', logoUrl: '' });
                 fetchBrands();
               } catch { toast.error('Hata oluştu.'); }
            }}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      {!activeTenant && (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-main)' }}>Lütfen bir mağaza seçin</h3>
          <p style={{ color: 'var(--text-muted)' }}>Markaları görüntülemek veya yönetmek için sağ üstteki menüden bir mağaza seçmelisiniz.</p>
        </div>
      )}

      {activeTenant && (
      <div style={{ background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
        <AdvancedDataTable<BrandDto>
          dataSource={brands}
          columns={[
            { field: 'name', title: 'Marka Adı', template: (row) => <strong>{row.name}</strong> },
            { field: 'slug', title: 'Slug' },
            { field: 'websiteUrl', title: 'Web Sitesi', template: (row) => row.websiteUrl ? <a href={row.websiteUrl} target="_blank" rel="noreferrer" style={{color: 'var(--color-primary)'}}>{row.websiteUrl}</a> : '-' },
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
          onDelete={handleDeleteBrand}
        />
      </div>
      )}
    </div>
  );
};
