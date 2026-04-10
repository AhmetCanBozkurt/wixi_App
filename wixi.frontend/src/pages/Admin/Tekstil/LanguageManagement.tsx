import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import AdvancedDataTable from '../../../components/admin/AdvancedDataTable';
import type { Column } from '../../../components/admin/AdvancedDataTable';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import type { LanguageDto, CreateLanguageDto, UpdateLanguageDto } from '../../../ApiServices/types/TekstilTypes';
import { API_ROUTES } from '../../../ApiServices/config/api.config';

const LanguageManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageDto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState<CreateLanguageDto>({
    code: '',
    name: '',
    nativeName: '',
    flagIcon: '',
    isDefault: false,
    isActive: true,
    displayOrder: 0
  });

  const columns: Column<LanguageDto>[] = [
    {
      key: 'code',
      header: 'Kod',
      sortable: true,
      searchable: true,
      width: '100px'
    },
    {
      key: 'name',
      header: 'İsim',
      sortable: true,
      searchable: true
    },
    {
      key: 'nativeName',
      header: 'Yerel İsim',
      sortable: true
    },
    {
      key: 'flagIcon',
      header: 'Bayrak',
      render: (value) => <span className="text-2xl">{value}</span>,
      width: '80px'
    },
    {
      key: 'isDefault',
      header: 'Varsayılan',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
          {value ? 'Evet' : 'Hayır'}
        </span>
      ),
      width: '120px'
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
    },
    {
      key: 'displayOrder',
      header: 'Sıra',
      sortable: true,
      width: '80px'
    }
  ];

  const handleOpenModal = (language?: LanguageDto) => {
    if (language) {
      setEditingLanguage(language);
      setFormData({
        code: language.code,
        name: language.name,
        nativeName: language.nativeName || '',
        flagIcon: language.flagIcon || '',
        isDefault: language.isDefault,
        isActive: language.isActive,
        displayOrder: language.displayOrder
      });
    } else {
      setEditingLanguage(null);
      setFormData({
        code: '',
        name: '',
        nativeName: '',
        flagIcon: '',
        isDefault: false,
        isActive: true,
        displayOrder: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLanguage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLanguage) {
        await tekstilLanguageService.updateLanguage(editingLanguage.id, formData as UpdateLanguageDto);
      } else {
        await tekstilLanguageService.createLanguage(formData);
      }
      handleCloseModal();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving language:', error);
      alert('Dil kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu dili silmek istediğinizden emin misiniz?')) return;
    
    try {
      await tekstilLanguageService.deleteLanguage(id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting language:', error);
      alert('Dil silinirken hata oluştu');
    }
  };

  const detailModal = (row: LanguageDto, onClose: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kod</label>
          <p className="text-gray-900 dark:text-gray-100">{row.code}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İsim</label>
          <p className="text-gray-900 dark:text-gray-100">{row.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yerel İsim</label>
          <p className="text-gray-900 dark:text-gray-100">{row.nativeName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bayrak</label>
          <p className="text-2xl">{row.flagIcon}</p>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dil Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaPlus /> Yeni Dil Ekle
        </button>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_ROUTES.TEKSTIL.LANGUAGES}`}
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
                  {editingLanguage ? 'Dil Düzenle' : 'Yeni Dil Ekle'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kod *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="tr, en, de"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İsim *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Turkish, English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Yerel İsim
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formData.nativeName}
                      onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Türkçe, English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bayrak (Emoji)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.flagIcon}
                      onChange={(e) => setFormData({ ...formData, flagIcon: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="🇹🇷 🇬🇧 🇩🇪"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sıra
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ ...formData, displayOrder: isNaN(value) ? 0 : value });
                      }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Varsayılan Dil</span>
                  </label>

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

export default LanguageManagement;


