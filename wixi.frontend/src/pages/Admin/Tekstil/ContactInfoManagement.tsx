import React, { useState, useEffect } from 'react';
import { FaSave, FaGlobe } from 'react-icons/fa';
import type { ContactInfoDto, CreateContactInfoDto, UpdateContactInfoDto, ContactInfoTranslationDto, LanguageDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilContactInfoService from '../../../ApiServices/services/TekstilContactInfoService';
import tekstilLanguageService from '../../../ApiServices/services/TekstilLanguageService';
import { toast } from 'sonner';

const ContactInfoManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfoDto | null>(null);

  const [formData, setFormData] = useState<CreateContactInfoDto>({
    companyName: '',
    phone1: '',
    phone2: '',
    email1: '',
    email2: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    mapLatitude: undefined,
    mapLongitude: undefined,
    mapZoomLevel: 15,
    whatsAppNumber: '',
    socialMediaLinks: '',
    isActive: true,
    translations: []
  });

  useEffect(() => {
    loadLanguages();
    loadContactInfo();
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

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const result = await tekstilContactInfoService.getActiveContactInfo();
      if (result.success && result.data) {
        setContactInfo(result.data);
        setFormData({
          companyName: result.data.companyName || '',
          phone1: result.data.phone1 || '',
          phone2: result.data.phone2 || '',
          email1: result.data.email1 || '',
          email2: result.data.email2 || '',
          address: result.data.address || '',
          city: result.data.city || '',
          district: result.data.district || '',
          postalCode: result.data.postalCode || '',
          mapLatitude: result.data.mapLatitude,
          mapLongitude: result.data.mapLongitude,
          mapZoomLevel: result.data.mapZoomLevel || 15,
          whatsAppNumber: result.data.whatsAppNumber || '',
          socialMediaLinks: result.data.socialMediaLinks || '',
          isActive: result.data.isActive ?? true,
          translations: result.data.translations || []
        });
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (langCode: string, field: 'workingHoursWeekday' | 'workingHoursSaturday' | 'workingHoursSunday' | 'whatsAppMessage', value: string) => {
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
      setSaving(true);
      if (contactInfo && contactInfo.id) {
        const result = await tekstilContactInfoService.updateContactInfo(contactInfo.id, formData as UpdateContactInfoDto);
        if (result.success) {
          toast.success('İletişim bilgileri başarıyla güncellendi');
          await loadContactInfo();
        } else {
          toast.error(result.message || 'Güncelleme başarısız');
        }
      } else {
        const result = await tekstilContactInfoService.createContactInfo(formData);
        if (result.success) {
          toast.success('İletişim bilgileri başarıyla oluşturuldu');
          await loadContactInfo();
        } else {
          toast.error(result.message || 'Oluşturma başarısız');
        }
      }
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast.error(error.message || 'İletişim bilgileri kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">İletişim Bilgileri Yönetimi</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          İletişim bilgilerini düzenleyin. Bu bilgiler web sitesinde gösterilecektir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şirket Adı *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefon 1 *
              </label>
              <input
                type="text"
                required
                value={formData.phone1}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefon 2
              </label>
              <input
                type="text"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-posta 1 *
              </label>
              <input
                type="email"
                required
                value={formData.email1}
                onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-posta 2
              </label>
              <input
                type="email"
                value={formData.email2}
                onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp Numarası
              </label>
              <input
                type="text"
                value={formData.whatsAppNumber}
                onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adres *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şehir
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlçe
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Posta Kodu
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Harita Ayarları</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enlem (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.mapLatitude || ''}
                onChange={(e) => setFormData({ ...formData, mapLatitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Boylam (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.mapLongitude || ''}
                onChange={(e) => setFormData({ ...formData, mapLongitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zoom Seviyesi
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.mapZoomLevel}
                onChange={(e) => setFormData({ ...formData, mapZoomLevel: parseInt(e.target.value) || 15 })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Translations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaGlobe className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Çeviriler</h2>
          </div>
          
          <div className="space-y-4">
            {languages.map((lang) => {
              const translation = formData.translations?.find(t => t.languageCode === lang.code) || {
                languageCode: lang.code,
                workingHoursWeekday: '',
                workingHoursSaturday: '',
                workingHoursSunday: '',
                whatsAppMessage: ''
              };
              
              return (
                <div key={lang.code} className="p-4 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{lang.flagIcon}</span>
                    <span className="font-semibold">{lang.name} ({lang.code.toUpperCase()})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hafta İçi Çalışma Saatleri</label>
                      <input
                        type="text"
                        value={translation.workingHoursWeekday || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'workingHoursWeekday', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="09:00 - 18:00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cumartesi Çalışma Saatleri</label>
                      <input
                        type="text"
                        value={translation.workingHoursSaturday || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'workingHoursSaturday', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="09:00 - 13:00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pazar Çalışma Saatleri</label>
                      <input
                        type="text"
                        value={translation.workingHoursSunday || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'workingHoursSunday', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Kapalı"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">WhatsApp Mesajı</label>
                      <input
                        type="text"
                        value={translation.whatsAppMessage || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'whatsAppMessage', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Merhaba, bilgi almak istiyorum"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoManagement;

