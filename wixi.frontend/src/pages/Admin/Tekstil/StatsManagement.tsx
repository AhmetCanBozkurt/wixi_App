import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import AdvancedDataTable from '../../../components/admin/AdvancedDataTable';
import type { Column } from '../../../components/admin/AdvancedDataTable';
import type { StatDto, CreateStatDto, UpdateStatDto, StatTranslationDto, LanguageDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import tekstilStatsService from '../../../ApiServices/services/TekstilStatsService';
import { BASE_URL } from '../../../ApiServices/config/api.config';

const API_BASE_URL = BASE_URL;

const StatsManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState<StatDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [selectedLang, setSelectedLang] = useState('tr');

  const [formData, setFormData] = useState<CreateStatDto>({
    iconName: '',
    displayOrder: 0,
    isActive: true,
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

  const columns: Column<StatDto>[] = [
    {
      key: 'iconName',
      header: 'İkon',
      render: (value) => <span className="text-2xl">{value}</span>,
      width: '100px'
    },
    {
      key: 'translations',
      header: 'Etiket/Değer',
      render: (value: StatTranslationDto[] | undefined) => {
        const trTranslation = value?.find(t => t.languageCode === 'tr');
        return trTranslation ? `${trTranslation.label || '-'} / ${trTranslation.value || '-'}` : '-';
      },
      sortable: false,
      searchable: false
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

  const handleOpenModal = (stat?: StatDto) => {
    if (stat) {
      setEditingStat(stat);
      setFormData({
        iconName: stat.iconName,
        displayOrder: stat.displayOrder,
        isActive: stat.isActive,
        translations: stat.translations || []
      });
    } else {
      setEditingStat(null);
      setFormData({
        iconName: '',
        displayOrder: 0,
        isActive: true,
        translations: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStat) {
        const result = await tekstilStatsService.updateStat(editingStat.id!, formData as UpdateStatDto);
        if (!result.success) {
          throw new Error(result.message || 'Failed to update');
        }
      } else {
        const result = await tekstilStatsService.createStat(formData);
        if (!result.success) {
          throw new Error(result.message || 'Failed to create');
        }
      }

      handleCloseModal();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving stat:', error);
      alert(error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu istatistiği silmek istediğinizden emin misiniz?')) return;
    
    try {
      const result = await tekstilStatsService.deleteStat(id);
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete');
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting stat:', error);
      alert(error instanceof Error ? error.message : 'Silme sırasında hata oluştu');
    }
  };

  const updateTranslation = (langCode: string, field: 'label' | 'value', value: string) => {
    const translations = formData.translations || [];
    const existingIndex = translations.findIndex(t => t.languageCode === langCode);
    
    if (existingIndex >= 0) {
      const updated = [...translations];
      updated[existingIndex] = { ...updated[existingIndex], [field]: value };
      setFormData({ ...formData, translations: updated });
    } else {
      setFormData({
        ...formData,
        translations: [...translations, { languageCode: langCode, [field]: value, label: '', value: '' } as StatTranslationDto]
      });
    }
  };

  const getTranslation = (langCode: string, field: 'label' | 'value'): string => {
    const translation = formData.translations?.find(t => t.languageCode === langCode);
    return translation?.[field] || '';
  };

  const detailModal = (row: StatDto, onClose: () => void) => (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-6xl">{row.iconName}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiket</label>
          <p className="text-gray-900 dark:text-gray-100">{row.translations?.find(t => t.languageCode === 'tr')?.label || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Değer</label>
          <p className="text-gray-900 dark:text-gray-100 text-2xl font-bold">{row.translations?.find(t => t.languageCode === 'tr')?.value || '-'}</p>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">İstatistikler Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Yeni İstatistik Ekle
        </button>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_BASE_URL}/api/v1.0/tekstil/stats`}
        columns={columns}
        detailModal={detailModal}
        getAuthToken={async () => localStorage.getItem('token')}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {editingStat ? 'İstatistik Düzenle' : 'Yeni İstatistik Ekle'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Language Tabs */}
              <div className="flex gap-2 mb-4 border-b dark:border-gray-700">
                {languages.map(lang => (
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
                {selectedLang === 'tr' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İkon (Emoji) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-2xl"
                      placeholder="📊 💼 🏭 👥"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Etiket ({selectedLang.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      required
                      value={getTranslation(selectedLang, 'label')}
                      onChange={(e) => updateTranslation(selectedLang, 'label', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Yıllık Deneyim"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Değer ({selectedLang.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      required
                      value={getTranslation(selectedLang, 'value')}
                      onChange={(e) => updateTranslation(selectedLang, 'value', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="25+"
                    />
                  </div>
                </div>

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

export default StatsManagement;


