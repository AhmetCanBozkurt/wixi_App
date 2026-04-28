import { useState, useEffect, useCallback } from 'react';
import { FaBoxOpen, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Button, Modal, Input, Select, ImageUpload } from '../../shared/ui';
import { TenantSelector } from '../../features/TenantSelector/TenantSelector';

interface ProductDto {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryName?: string;
  brandName?: string;
  variantCount: number;
  isActive: boolean;
  trackInventory: boolean;
  mainImageUrl?: string;
  createdAt: string;
}

export const ECommerceProductsPage = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListDto | null>(null);
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [isQuickBrandModalOpen, setIsQuickBrandModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    basePrice: 0,
    categoryId: '',
    brandId: '',
    shortDescription: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    mainImageUrl: '',
    galleryUrls: [] as string[],
    trackInventory: true
  });

  const [activeTenant, setActiveTenant] = useState(() => localStorage.getItem('wixi-active-tenant') || '');

  const fetchProducts = useCallback(async () => {
    if (!activeTenant) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<any>('admin/ecommerce/products');
      // Backend'den GetProductsResult (items, totalCount vb.) dönüyor.
      // res.data.items bizim asıl ürün listemiz.
      let data = [];
      if (res.data && Array.isArray(res.data.items)) {
        data = res.data.items;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.items?.items) {
        data = res.data.items.items;
      }
      
      setProducts(data);
    } catch (err) {
      console.error("Ürün listesi hatası:", err);
      toast.error('Ürün listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [activeTenant]);

  const fetchLookups = useCallback(async () => {
    if (!activeTenant) return;
    try {
      const [catRes, brandRes] = await Promise.all([
        apiClient.get('admin/ecommerce/categories'),
        apiClient.get('admin/ecommerce/brands')
      ]);
      setCategories((catRes.data as any).items || []);
      setBrands((brandRes.data as any).items || []);
    } catch (err) {
      // Sessiz hata, loglar silindi
    }
  }, [activeTenant]);

  useEffect(() => {
    fetchProducts();
    fetchLookups();
  }, [fetchProducts, fetchLookups]);

  const handleDeleteProduct = async (product: ProductDto) => {
    const result = await Swal.fire({
      title: 'Silmek istiyor musunuz?',
      text: `${product.name} silinecektir. Bu işlem geri alınamaz.`,
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
        await apiClient.delete(`admin/ecommerce/products/${product.id}`);
        toast.success('Ürün başarıyla silindi.');
        fetchProducts();
      } catch (err) {
        console.error("Ürün silme hatası:", err);
        toast.error('Silme işlemi başarısız.');
      }
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, mainImageUrl: '' }));
      return;
    }

    const toastId = toast.loading('Resim yükleniyor...');
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await apiClient.post('Files/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, mainImageUrl: res.data.url }));
      toast.success('Resim yüklendi.', { id: toastId });
    } catch (err) {
      toast.error('Resim yüklenemedi.', { id: toastId });
    }
  };

  const handleGalleryUpload = async (file: File | null) => {
    if (!file) return;

    const toastId = toast.loading('Resim galeriye ekleniyor...');
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await apiClient.post('Files/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        galleryUrls: [...prev.galleryUrls, res.data.url] 
      }));
      toast.success('Resim eklendi.', { id: toastId });
    } catch (err) {
      toast.error('Resim eklenemedi.', { id: toastId });
    }
  };

  const removeGalleryImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter(u => u !== url)
    }));
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <FaBoxOpen style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Ürün Kataloğu</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Mağazanıza ait ürünleri listeleyin ve yönetin.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <TenantSelector onTenantChange={setActiveTenant} />
          {activeTenant && (
            <Button 
              variant="secondary" 
              onClick={async () => {
                try {
                  toast.loading('Örnek veriler yükleniyor...', { id: 'seed' });
                  await apiClient.post('admin/ecommerce/seed');
                  toast.success('Örnek veriler başarıyla yüklendi!', { id: 'seed' });
                  fetchProducts();
                  fetchLookups();
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Hata oluştu.', { id: 'seed' });
                }
              }}
            >
              Örnek Veri Yükle
            </Button>
          )}
          <Button variant="primary" onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '', slug: '', basePrice: 0, categoryId: '', brandId: '',
              shortDescription: '', description: '', metaTitle: '', metaDescription: '',
              mainImageUrl: '', trackInventory: true
            });
            setIsModalOpen(true);
          }} leftIcon={<FaPlus />} disabled={!activeTenant}>
            Yeni Ürün Ekle
          </Button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"} size="lg">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
          <Input 
            label="Ürün Adı" 
            value={formData.name} 
            onChange={e => {
              const val = e.target.value;
              setFormData({...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-')});
            }}
            placeholder="Örn: Wixi Basic T-Shirt"
            required
          />
          <Input 
            label="Ürün Adresi (Slug)" 
            value={formData.slug} 
            onChange={e => setFormData({...formData, slug: e.target.value})}
            placeholder="Örn: wixi-basic-t-shirt"
            required
          />
          <Input 
            label="Taban Fiyat (₺)" 
            type="number"
            value={formData.basePrice} 
            onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
            required
          />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <Select 
                label="Kategori"
                value={formData.categoryId}
                onChange={val => setFormData({...formData, categoryId: val as string})}
                options={[
                  { value: '', label: 'Kategori Seçin' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
            <Button variant="primary" onClick={() => setIsQuickCatModalOpen(true)} style={{ padding: '8px 12px', height: '42px', marginBottom: '4px' }}>
              <FaPlus />
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <Select 
                label="Marka"
                value={formData.brandId}
                onChange={val => setFormData({...formData, brandId: val as string})}
                options={[
                  { value: '', label: 'Marka Seçin' },
                  ...brands.map(b => ({ value: b.id, label: b.name }))
                ]}
              />
            </div>
            <Button variant="primary" onClick={() => setIsQuickBrandModalOpen(true)} style={{ padding: '8px 12px', height: '42px', marginBottom: '4px' }}>
              <FaPlus />
            </Button>
          </div>
          <Input 
            label="Kısa Açıklama" 
            value={formData.shortDescription} 
            onChange={e => setFormData({...formData, shortDescription: e.target.value})}
            placeholder="Ürün listesinde görünecek kısa metin"
          />
          <div style={{ gridColumn: 'span 2' }}>
             <Input 
              label="SEO Başlık" 
              value={formData.metaTitle} 
              onChange={e => setFormData({...formData, metaTitle: e.target.value})}
            />
             <Input 
              label="SEO Açıklama" 
              value={formData.metaDescription} 
              onChange={e => setFormData({...formData, metaDescription: e.target.value})}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <ImageUpload 
              label="Ürün Ana Görseli"
              value={formData.mainImageUrl}
              onFileChange={handleImageUpload}
              shape="square"
              size={120}
              hint="Ana kapak fotoğrafı."
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Ürün Galerisi</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
              {formData.galleryUrls.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeGalleryImage(url)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 5px', cursor: 'pointer', fontSize: '10px' }}
                  >
                    X
                  </button>
                </div>
              ))}
              <ImageUpload 
                onFileChange={handleGalleryUpload}
                shape="square"
                size={80}
                hint=""
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>Ürün detay sayfasında görünecek ek görseller.</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', padding: '10px', borderTop: '1px solid var(--border-glass)' }}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>İptal</Button>
          <Button variant="primary" onClick={async () => {
            if (!formData.name || !formData.slug || formData.basePrice <= 0) {
              toast.error('Lütfen zorunlu alanları doldurun.');
              return;
            }
            try {
              if (editingProduct) {
                await apiClient.put(`admin/ecommerce/products/${editingProduct.id}`, { ...formData, id: editingProduct.id });
                toast.success('Ürün güncellendi.');
              } else {
                await apiClient.post('admin/ecommerce/products', formData);
                toast.success('Ürün eklendi.');
              }
              setIsModalOpen(false);
              fetchProducts();
            } catch {
              toast.error('İşlem sırasında hata oluştu.');
            }
          }}>Kaydet</Button>
        </div>
      </Modal>

      {/* Quick Add Category Modal */}
      <Modal isOpen={isQuickCatModalOpen} onClose={() => setIsQuickCatModalOpen(false)} title="Hızlı Kategori Ekle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Input 
            label="Kategori Adı" 
            placeholder="Örn: Elektronik"
            onChange={e => {
              const val = e.target.value;
              (window as any)._quickCat = { name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-') };
            }}
          />
          <Button variant="primary" onClick={async () => {
            const data = (window as any)._quickCat;
            if (!data?.name) return toast.error('Ad gereklidir');
            try {
              const payload = { ...data, parentId: null };
              await apiClient.post('admin/ecommerce/categories', payload);
              toast.success('Kategori eklendi');
              setIsQuickCatModalOpen(false);
              fetchLookups();
            } catch { toast.error('Hata oluştu'); }
          }}>Ekle</Button>
        </div>
      </Modal>

      {/* Quick Add Brand Modal */}
      <Modal isOpen={isQuickBrandModalOpen} onClose={() => setIsQuickBrandModalOpen(false)} title="Hızlı Marka Ekle">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Input 
            label="Marka Adı" 
            placeholder="Örn: Wixi"
            onChange={e => {
              const val = e.target.value;
              (window as any)._quickBrand = { name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-') };
            }}
          />
          <Button variant="primary" onClick={async () => {
            const data = (window as any)._quickBrand;
            if (!data?.name) return toast.error('Ad gereklidir');
            try {
              await apiClient.post('admin/ecommerce/brands', data);
              toast.success('Marka eklendi');
              setIsQuickBrandModalOpen(false);
              fetchLookups();
            } catch { toast.error('Hata oluştu'); }
          }}>Ekle</Button>
        </div>
      </Modal>

      {!activeTenant && (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-main)' }}>Lütfen bir mağaza seçin</h3>
          <p style={{ color: 'var(--text-muted)' }}>Ürünleri görüntülemek veya yönetmek için sağ üstteki menüden bir mağaza seçmelisiniz.</p>
        </div>
      )}

      {activeTenant && (
      <div style={{ background: 'var(--surface-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
        <AdvancedDataTable<ProductDto>
          dataSource={products}
          columns={[
            { 
              field: 'mainImageUrl', 
              title: 'Görsel', 
              width: 80,
              template: (row) => (
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.mainImageUrl ? (
                    <img src={row.mainImageUrl} alt={row.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FaBoxOpen style={{ opacity: 0.3 }} />
                  )}
                </div>
              )
            },
            { field: 'name', title: 'Ürün Adı', template: (row) => <strong>{row.name}</strong> },
            { field: 'slug', title: 'Slug' },
            { field: 'basePrice', title: 'Fiyat', template: (row) => `${row.basePrice} ₺` },
            { field: 'categoryName', title: 'Kategori', template: (row) => row.categoryName || '-' },
            { field: 'brandName', title: 'Marka', template: (row) => row.brandName || '-' },
            { field: 'variantCount', title: 'Varyant', width: 100 },
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
          selectable={true}
          exportable={{
            fileName: 'urun_katalogu',
            pdf: true,
            excel: true
          }}
          onEdit={(row) => {
            setEditingProduct(row);
            setFormData({
              name: row.name,
              slug: row.slug,
              basePrice: row.basePrice,
              categoryId: categories.find(c => c.name === row.categoryName)?.id || '',
              brandId: brands.find(b => b.name === row.brandName)?.id || '',
              shortDescription: '', // Detay API gerekebilir ama şimdilik boş
              description: '',
              metaTitle: '',
              metaDescription: '',
              mainImageUrl: row.mainImageUrl || '',
              galleryUrls: (row as any).galleryUrls || [], 
              trackInventory: row.trackInventory
            });
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteProduct}
        />
      </div>
      )}
    </div>
  );
};
