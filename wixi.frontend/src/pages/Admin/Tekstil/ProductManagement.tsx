import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGlobe } from 'react-icons/fa';
import AdvancedDataTable, { type Column } from '../../../components/admin/AdvancedDataTable';
import type { ProductDto, CreateProductDto, UpdateProductDto, ProductTranslationDto, ProductCategoryDto, LanguageDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilProductService from '../../../ApiServices/services/TekstilProductService';
import tekstilProductCategoryService from '../../../ApiServices/services/TekstilProductCategoryService';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import { toast } from 'sonner';
import { BASE_URL } from '../../../ApiServices/config/api.config';

const API_BASE_URL = BASE_URL;

const ProductManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
  const [selectedLang, setSelectedLang] = useState('tr');

  const [formData, setFormData] = useState<CreateProductDto>({
    productCategoryId: 0,
    slug: '',
    imageUrl: '',
    imageAlt: '',
    price: undefined,
    minOrderQuantity: undefined,
    features: undefined,
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    translations: [],
    images: []
  });

  useEffect(() => {
    loadLanguages();
    loadCategories();
  }, []);

  const loadLanguages = async () => {
    try {
      const result = await tekstilLanguageService.getAllLanguages();
      if (result.success) {
        setLanguages(result.data || []);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await tekstilProductCategoryService.getAllProductCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const columns: Column<ProductDto>[] = [
    {
      key: 'slug',
      header: 'Slug',
      sortable: true,
      searchable: true
    },
    {
      key: 'translations',
      header: 'Başlık',
      render: (value, row) => {
        const translation = row.translations?.find(t => t.languageCode === selectedLang) || 
                          row.translations?.find(t => t.languageCode === 'tr') ||
                          row.translations?.[0];
        return translation?.title || '-';
      },
      searchable: true
    },
    {
      key: 'productCategory',
      header: 'Kategori',
      render: (value, row) => {
        const category = row.productCategory || categories.find(c => c.id === row.productCategoryId);
        const trans = category?.translations?.find(t => t.languageCode === selectedLang) || category?.translations?.[0];
        return trans?.name || category?.slug || '-';
      }
    },
    {
      key: 'price',
      header: 'Fiyat',
      render: (value) => value ? `${value} ₺` : '-',
      width: '100px'
    },
    {
      key: 'isFeatured',
      header: 'Öne Çıkan',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Evet' : 'Hayır'}
        </span>
      ),
      width: '100px'
    },
    {
      key: 'isActive',
      header: 'Aktif',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
      width: '100px'
    },
    {
      key: 'viewCount',
      header: 'Görüntülenme',
      width: '100px'
    }
  ];

  const handleOpenModal = (product?: ProductDto) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productCategoryId: product.productCategoryId,
        slug: product.slug || '',
        imageUrl: product.imageUrl || '',
        imageAlt: product.imageAlt || '',
        price: product.price,
        minOrderQuantity: product.minOrderQuantity,
        features: product.features,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        displayOrder: product.displayOrder || 0,
        translations: product.translations || [],
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        productCategoryId: categories[0]?.id || 0,
        slug: '',
        imageUrl: '',
        imageAlt: '',
        price: undefined,
        minOrderQuantity: undefined,
        features: undefined,
        isActive: true,
        isFeatured: false,
        displayOrder: 0,
        translations: languages.map(lang => ({
          languageCode: lang.code,
          title: '',
          description: '',
          shortDescription: ''
        })),
        images: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleTranslationChange = (langCode: string, field: 'title' | 'description' | 'shortDescription', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations?.map(t =>
        t.languageCode === langCode ? { ...t, [field]: value } : t
      ) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct && editingProduct.id) {
        const result = await tekstilProductService.updateProduct(editingProduct.id, formData as UpdateProductDto);
        if (result.success) {
          toast.success('Ürün başarıyla güncellendi');
        } else {
          toast.error(result.message || 'Güncelleme başarısız');
        }
      } else {
        const result = await tekstilProductService.createProduct(formData);
        if (result.success) {
          toast.success('Ürün başarıyla oluşturuldu');
        } else {
          toast.error(result.message || 'Oluşturma başarısız');
        }
      }
      handleCloseModal();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Ürün kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
      const result = await tekstilProductService.deleteProduct(id);
      if (result.success) {
        toast.success('Ürün başarıyla silindi');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Silme başarısız');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Ürün silinirken hata oluştu');
    }
  };

  const detailModal = (row: ProductDto, onClose: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <p className="text-gray-900 dark:text-gray-100">{row.slug}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
          <p className="text-gray-900 dark:text-gray-100">
            {row.productCategory?.translations?.[0]?.name || row.productCategory?.slug || '-'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiyat</label>
          <p className="text-gray-900 dark:text-gray-100">{row.price ? `${row.price} ₺` : '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Sipariş</label>
          <p className="text-gray-900 dark:text-gray-100">{row.minOrderQuantity || '-'}</p>
        </div>
      </div>
      
      {row.imageUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Görsel</label>
          <img src={row.imageUrl} alt={row.imageAlt || ''} className="max-w-xs rounded" />
        </div>
      )}
      
      <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
        <button
          onClick={() => { onClose(); handleOpenModal(row); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaEdit /> Düzenle
        </button>
        <button
          onClick={() => { onClose(); handleDelete(row.id!); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FaTrash /> Sil
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ürünler Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Yeni Ürün Ekle
        </button>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_BASE_URL}/api/v1.0/tekstil/products`}
        columns={columns}
        detailModal={detailModal}
        getAuthToken={async () => localStorage.getItem('token')}
      />

      {/* Create/Edit Modal - çok uzun olacağı için kısaltılmış, gerekirse genişletilebilir */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori *
                    </label>
                    <select
                      required
                      value={formData.productCategoryId}
                      onChange={(e) => setFormData({ ...formData, productCategoryId: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value={0}>Seçiniz</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.translations?.[0]?.name || cat.slug}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="urun-adi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Görsel URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fiyat
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Öne Çıkan</span>
                  </label>
                </div>

                {/* Translations */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaGlobe className="text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Çeviriler</h4>
                  </div>
                  <div className="space-y-3">
                    {languages.map((lang) => {
                      const translation = formData.translations?.find(t => t.languageCode === lang.code) || {
                        languageCode: lang.code,
                        title: '',
                        description: '',
                        shortDescription: ''
                      };
                      
                      return (
                        <div key={lang.code} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{lang.flagIcon}</span>
                            <span className="font-semibold">{lang.name}</span>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={translation.title || ''}
                              onChange={(e) => handleTranslationChange(lang.code, 'title', e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="Başlık"
                            />
                            <textarea
                              value={translation.description || ''}
                              onChange={(e) => handleTranslationChange(lang.code, 'description', e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              rows={3}
                              placeholder="Açıklama"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FaSave /> Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

