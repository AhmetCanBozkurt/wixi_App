import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGlobe } from 'react-icons/fa';
import AdvancedDataTable, { type Column } from '../../../components/admin/AdvancedDataTable';
import type { ProjectCategoryDto, CreateProjectCategoryDto, UpdateProjectCategoryDto, LanguageDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilProjectCategoryService from '../../../ApiServices/services/TekstilProjectCategoryService';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import { toast } from 'sonner';
import { BASE_URL } from '../../../ApiServices/config/api.config';

const API_BASE_URL = BASE_URL;

const ProjectCategoryManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategoryDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [selectedLang, setSelectedLang] = useState('tr');

  const [formData, setFormData] = useState<CreateProjectCategoryDto>({
    slug: '',
    color: '',
    displayOrder: 0,
    isActive: true,
    translations: []
  });

  useEffect(() => {
    loadLanguages();
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

  const columns: Column<ProjectCategoryDto>[] = [
    {
      key: 'slug',
      header: 'Slug',
      sortable: true,
      searchable: true
    },
    {
      key: 'translations',
      header: 'İsim',
      render: (value, row) => {
        const translation = row.translations?.find(t => t.languageCode === selectedLang) || 
                          row.translations?.find(t => t.languageCode === 'tr') ||
                          row.translations?.[0];
        return translation?.name || '-';
      },
      searchable: true
    },
    {
      key: 'color',
      header: 'Renk',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border" style={{ backgroundColor: value }}></div>
          <span>{value}</span>
        </div>
      ) : '-',
      width: '120px'
    },
    {
      key: 'displayOrder',
      header: 'Sıra',
      sortable: true,
      width: '80px'
    },
    {
      key: 'isActive',
      header: 'Aktif',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
      width: '100px'
    }
  ];

  const handleOpenModal = (category?: ProjectCategoryDto) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        slug: category.slug || '',
        color: category.color || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true,
        translations: category.translations || []
      });
    } else {
      setEditingCategory(null);
      setFormData({
        slug: '',
        color: '',
        displayOrder: 0,
        isActive: true,
        translations: languages.map(lang => ({
          languageCode: lang.code,
          name: ''
        }))
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleTranslationChange = (langCode: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations?.map(t =>
        t.languageCode === langCode ? { ...t, name: value } : t
      ) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory && editingCategory.id) {
        const result = await tekstilProjectCategoryService.updateProjectCategory(editingCategory.id, formData as UpdateProjectCategoryDto);
        if (result.success) {
          toast.success('Proje kategorisi başarıyla güncellendi');
        } else {
          toast.error(result.message || 'Güncelleme başarısız');
        }
      } else {
        const result = await tekstilProjectCategoryService.createProjectCategory(formData);
        if (result.success) {
          toast.success('Proje kategorisi başarıyla oluşturuldu');
        } else {
          toast.error(result.message || 'Oluşturma başarısız');
        }
      }
      handleCloseModal();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error saving project category:', error);
      toast.error(error.message || 'Proje kategorisi kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu proje kategorisini silmek istediğinizden emin misiniz?')) return;
    
    try {
      const result = await tekstilProjectCategoryService.deleteProjectCategory(id);
      if (result.success) {
        toast.success('Proje kategorisi başarıyla silindi');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Silme başarısız');
      }
    } catch (error: any) {
      console.error('Error deleting project category:', error);
      toast.error(error.message || 'Proje kategorisi silinirken hata oluştu');
    }
  };

  const detailModal = (row: ProjectCategoryDto, onClose: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <p className="text-gray-900 dark:text-gray-100">{row.slug}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renk</label>
          <div className="flex items-center gap-2">
            {row.color && <div className="w-8 h-8 rounded border" style={{ backgroundColor: row.color }}></div>}
            <span>{row.color || '-'}</span>
          </div>
        </div>
      </div>
      
      {row.translations && row.translations.length > 0 && (
        <div className="border-t dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Çeviriler</label>
          <div className="space-y-2">
            {row.translations.map((trans, idx) => (
              <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold text-sm">{trans.languageCode.toUpperCase()}</div>
                <div className="text-sm mt-1">{trans.name}</div>
              </div>
            ))}
          </div>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Proje Kategorileri Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Yeni Kategori Ekle
        </button>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_BASE_URL}/api/v1.0/tekstil/project-categories`}
        columns={columns}
        detailModal={detailModal}
        getAuthToken={async () => localStorage.getItem('token')}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {editingCategory ? 'Proje Kategorisi Düzenle' : 'Yeni Proje Kategorisi Ekle'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="tshirt-projects"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Renk (Hex)
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="#FF5733"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sıra
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
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
                        name: ''
                      };
                      
                      return (
                        <div key={lang.code} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{lang.flagIcon}</span>
                            <span className="font-semibold">{lang.name} ({lang.code.toUpperCase()})</span>
                          </div>
                          <input
                            type="text"
                            value={translation.name || ''}
                            onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={`${lang.name} isim`}
                          />
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

export default ProjectCategoryManagement;

