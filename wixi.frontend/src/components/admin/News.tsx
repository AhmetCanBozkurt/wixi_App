import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaNewspaper } from 'react-icons/fa';
import NewsService, { type NewsItemDto } from '../../ApiServices/services/NewsService';
import { useToast } from '../../hooks/use-toast';
import { BASE_URL } from '../../ApiServices/config/api.config';

interface NewsItemData {
  id: number;
  titleDe: string;
  titleTr: string;
  titleEn?: string;
  titleAr?: string;
  excerptDe: string;
  excerptTr: string;
  excerptEn?: string;
  excerptAr?: string;
  contentDe?: string;
  contentTr?: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  publishedAt?: string;
  slug?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const News: React.FC = () => {
  const { toast } = useToast();
  const [newsItems, setNewsItems] = useState<NewsItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItemData | null>(null);
  const [formData, setFormData] = useState<NewsItemDto>({
    titleDe: '',
    titleTr: '',
    titleEn: '',
    titleAr: '',
    excerptDe: '',
    excerptTr: '',
    excerptEn: '',
    excerptAr: '',
    contentDe: '',
    contentTr: '',
    contentEn: '',
    contentAr: '',
    imageUrl: '',
    category: '',
    featured: false,
    publishedAt: '',
    slug: '',
    displayOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Helper function to get full image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${BASE_URL}${url}`;
    }
    return `${BASE_URL}/${url}`;
  };

  useEffect(() => {
    loadNewsItems();
  }, []);

  const loadNewsItems = async () => {
    try {
      setLoading(true);
      const res = await NewsService.getAllNewsItems();
      if (res.success) {
        setNewsItems(res.items || []);
      }
    } catch (error) {
      console.error('Error loading news items:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Haberler yüklenemedi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      titleDe: '',
      titleTr: '',
      titleEn: '',
      titleAr: '',
      excerptDe: '',
      excerptTr: '',
      excerptEn: '',
      excerptAr: '',
      contentDe: '',
      contentTr: '',
      contentEn: '',
      contentAr: '',
      imageUrl: '',
      category: '',
      featured: false,
      publishedAt: '',
      slug: '',
      displayOrder: 0,
      isActive: true,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Geçersiz dosya tipi. İzin verilen tipler: jpg, jpeg, png, gif, webp',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Dosya boyutu 5MB\'dan büyük olamaz.',
      });
      return;
    }

    try {
      setUploadingImage(true);
      const res = await NewsService.uploadImage(file);
      if (res.success && res.imageUrl) {
        setFormData({ ...formData, imageUrl: res.imageUrl });
        setImagePreview(res.imageUrl);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Görsel başarıyla yüklendi.',
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: error.message || 'Görsel yüklenemedi.',
      });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleEdit = (item: NewsItemData) => {
    setEditingItem(item);
    setFormData({
      titleDe: item.titleDe,
      titleTr: item.titleTr,
      titleEn: item.titleEn || '',
      titleAr: item.titleAr || '',
      excerptDe: item.excerptDe,
      excerptTr: item.excerptTr,
      excerptEn: item.excerptEn || '',
      excerptAr: item.excerptAr || '',
      contentDe: item.contentDe || '',
      contentTr: item.contentTr || '',
      contentEn: item.contentEn || '',
      contentAr: item.contentAr || '',
      imageUrl: item.imageUrl,
      category: item.category,
      featured: item.featured,
      publishedAt: item.publishedAt || '',
      slug: item.slug || '',
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setImagePreview(item.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;

    try {
      await NewsService.deleteNewsItem(id);
      toast({
        variant: 'default',
        title: '✅ Başarılı',
        description: 'Haber silindi.',
      });
      loadNewsItems();
    } catch (error: any) {
      console.error('Error deleting news item:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: error.message || 'Haber silinemedi.',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.titleDe || !formData.titleTr || !formData.excerptDe || !formData.excerptTr || !formData.imageUrl || !formData.category) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun (DE ve TR başlık, özet, görsel, kategori).',
      });
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await NewsService.updateNewsItem(editingItem.id, formData);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Haber güncellendi.',
        });
      } else {
        await NewsService.createNewsItem(formData);
        toast({
          variant: 'default',
          title: '✅ Başarılı',
          description: 'Haber oluşturuldu.',
        });
      }
      setShowModal(false);
      loadNewsItems();
    } catch (error: any) {
      console.error('Error saving news item:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: error.message || 'Haber kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">Haberler</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <FaPlus /> Yeni Ekle
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sıra</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Görsel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Başlık (DE)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Öne Çıkan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {newsItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Henüz haber eklenmemiş.
                </td>
              </tr>
            ) : (
              newsItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <img src={getImageUrl(item.imageUrl)} alt={item.titleDe} className="w-16 h-16 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{item.titleDe}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.featured ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {item.featured ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-300"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                  {editingItem ? 'Haber Düzenle' : 'Yeni Haber'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                {/* Title */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Başlık *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <input
                        type="text"
                        value={formData.titleDe}
                        onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <input
                        type="text"
                        value={formData.titleTr}
                        onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <input
                        type="text"
                        value={formData.titleAr}
                        onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Özet *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE *</label>
                      <textarea
                        value={formData.excerptDe}
                        onChange={(e) => setFormData({ ...formData, excerptDe: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR *</label>
                      <textarea
                        value={formData.excerptTr}
                        onChange={(e) => setFormData({ ...formData, excerptTr: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <textarea
                        value={formData.excerptEn}
                        onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <textarea
                        value={formData.excerptAr}
                        onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Content (Optional) */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">İçerik (Opsiyonel)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DE</label>
                      <textarea
                        value={formData.contentDe}
                        onChange={(e) => setFormData({ ...formData, contentDe: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TR</label>
                      <textarea
                        value={formData.contentTr}
                        onChange={(e) => setFormData({ ...formData, contentTr: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EN</label>
                      <textarea
                        value={formData.contentEn}
                        onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AR</label>
                      <textarea
                        value={formData.contentAr}
                        onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Görsel *</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 disabled:opacity-50"
                        />
                      </div>
                      {uploadingImage && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      )}
                    </div>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="mt-2">
                        <img
                          src={getImageUrl(imagePreview || formData.imageUrl)}
                          alt="Preview"
                          className="w-48 h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="veya görsel URL'si girin"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Other Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="örn: Eğitim, Duyuru, Haber"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="url-friendly-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yayın Tarihi</label>
                    <input
                      type="datetime-local"
                      value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sıra</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded"
                      />
                      Öne Çıkan
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-6">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded"
                      />
                      Aktif
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FaSave /> Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;

