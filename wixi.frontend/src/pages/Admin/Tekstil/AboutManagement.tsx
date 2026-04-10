import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGlobe } from 'react-icons/fa';
import AdvancedDataTable from '../../../components/admin/AdvancedDataTable';
import type { Column } from '../../../components/admin/AdvancedDataTable';
import type { AboutDto, CreateAboutDto, UpdateAboutDto, AboutTranslationDto, LanguageDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import tekstilAboutService from '../../../ApiServices/services/TekstilAboutService';
import { BASE_URL } from '../../../ApiServices/config/api.config';

const API_BASE_URL = BASE_URL;

const AboutManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAbout, setEditingAbout] = useState<AboutDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [selectedLang, setSelectedLang] = useState('tr');

  const [formData, setFormData] = useState<CreateAboutDto>({
    title: '',
    description: '',
    missionTitle: '',
    missionDescription: '',
    visionTitle: '',
    visionDescription: '',
    isActive: true,
    displayOrder: 0,
    translations: []
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const { data: langs, success } = await tekstilLanguageService.getAllLanguages();
      if (success) {
        setLanguages(langs);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const columns: Column<AboutDto>[] = [
    {
      key: 'title',
      header: 'Başlık',
      sortable: true,
      searchable: true
    },
    {
      key: 'missionTitle',
      header: 'Misyon Başlığı',
      sortable: true
    },
    {
      key: 'visionTitle',
      header: 'Vizyon Başlığı',
      sortable: true
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      ),
      width: '100px'
    },
    {
      key: 'displayOrder',
      header: 'Sıra',
      sortable: true,
      width: '80px'
    }
  ];

  const handleOpenModal = (about?: AboutDto) => {
    if (about) {
      setEditingAbout(about);
      setFormData({
        title: about.title,
        description: about.description,
        missionTitle: about.missionTitle,
        missionDescription: about.missionDescription,
        visionTitle: about.visionTitle,
        visionDescription: about.visionDescription,
        isActive: about.isActive,
        displayOrder: about.displayOrder,
        translations: about.translations || []
      });
    } else {
      setEditingAbout(null);
      setFormData({
        title: '',
        description: '',
        missionTitle: '',
        missionDescription: '',
        visionTitle: '',
        visionDescription: '',
        isActive: true,
        displayOrder: 0,
        translations: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAbout(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAbout) {
        const result = await tekstilAboutService.updateAbout(editingAbout.id!, formData as UpdateAboutDto);
        if (!result.success) {
          throw new Error(result.message || 'Failed to update');
        }
      } else {
        const result = await tekstilAboutService.createAbout(formData);
        if (!result.success) {
          throw new Error(result.message || 'Failed to create');
        }
      }

      handleCloseModal();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving about:', error);
      alert(error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const result = await tekstilAboutService.deleteAbout(id);
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete');
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting about:', error);
      alert(error instanceof Error ? error.message : 'Silme sırasında hata oluştu');
    }
  };

  const updateTranslation = (langCode: string, field: keyof AboutTranslationDto, value: string) => {
    const translations = formData.translations || [];
    const existingIndex = translations.findIndex(t => t.languageCode === langCode);
    
    if (existingIndex >= 0) {
      const updated = [...translations];
      updated[existingIndex] = { ...updated[existingIndex], [field]: value };
      setFormData({ ...formData, translations: updated });
    } else {
      setFormData({
        ...formData,
        translations: [...translations, { languageCode: langCode, [field]: value } as AboutTranslationDto]
      });
    }
  };

  const getTranslation = (langCode: string, field: keyof AboutTranslationDto): string => {
    const translation = formData.translations?.find(t => t.languageCode === langCode);
    return translation?.[field] as string || '';
  };

  const detailModal = (row: AboutDto, onClose: () => void) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
        <p className="text-gray-900 dark:text-gray-100">{row.title}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
        <p className="text-gray-900 dark:text-gray-100">{row.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misyon</label>
          <p className="text-gray-900 dark:text-gray-100 font-semibold">{row.missionTitle}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{row.missionDescription}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vizyon</label>
          <p className="text-gray-900 dark:text-gray-100 font-semibold">{row.visionTitle}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{row.visionDescription}</p>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
        <button
          onClick={() => { onClose(); handleOpenModal(row); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaEdit /> Düzenle
        </button>
        <button
          onClick={() => { onClose(); handleDelete(row.id); }}
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hakkımızda Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Yeni Ekle
        </button>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_BASE_URL}/api/v1.0/tekstil/about`}
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
                  {editingAbout ? 'Düzenle' : 'Yeni Ekle'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Language Tabs */}
              <div className="flex gap-2 mb-4 border-b dark:border-gray-700">
                <button
                  onClick={() => setSelectedLang('tr')}
                  className={`px-4 py-2 ${selectedLang === 'tr' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  🇹🇷 Türkçe (Ana)
                </button>
                {languages.filter(l => l.code !== 'tr').map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`px-4 py-2 flex items-center gap-2 ${selectedLang === lang.code ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {lang.flagIcon} {lang.name}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedLang === 'tr' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misyon Başlığı *</label>
                        <input
                          type="text"
                          required
                          value={formData.missionTitle}
                          onChange={(e) => setFormData({ ...formData, missionTitle: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vizyon Başlığı *</label>
                        <input
                          type="text"
                          required
                          value={formData.visionTitle}
                          onChange={(e) => setFormData({ ...formData, visionTitle: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misyon Açıklaması *</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.missionDescription}
                          onChange={(e) => setFormData({ ...formData, missionDescription: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vizyon Açıklaması *</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.visionDescription}
                          onChange={(e) => setFormData({ ...formData, visionDescription: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık ({selectedLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={getTranslation(selectedLang, 'title')}
                        onChange={(e) => updateTranslation(selectedLang, 'title', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama ({selectedLang.toUpperCase()})</label>
                      <textarea
                        rows={4}
                        value={getTranslation(selectedLang, 'description')}
                        onChange={(e) => updateTranslation(selectedLang, 'description', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misyon Başlığı ({selectedLang.toUpperCase()})</label>
                        <input
                          type="text"
                          value={getTranslation(selectedLang, 'missionTitle')}
                          onChange={(e) => updateTranslation(selectedLang, 'missionTitle', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vizyon Başlığı ({selectedLang.toUpperCase()})</label>
                        <input
                          type="text"
                          value={getTranslation(selectedLang, 'visionTitle')}
                          onChange={(e) => updateTranslation(selectedLang, 'visionTitle', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Misyon Açıklaması ({selectedLang.toUpperCase()})</label>
                        <textarea
                          rows={3}
                          value={getTranslation(selectedLang, 'missionDescription')}
                          onChange={(e) => updateTranslation(selectedLang, 'missionDescription', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vizyon Açıklaması ({selectedLang.toUpperCase()})</label>
                        <textarea
                          rows={3}
                          value={getTranslation(selectedLang, 'visionDescription')}
                          onChange={(e) => updateTranslation(selectedLang, 'visionDescription', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedLang === 'tr' && (
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
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mr-2">Sıra:</label>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                        className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}

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

export default AboutManagement;


