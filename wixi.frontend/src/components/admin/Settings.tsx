import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaSave, 
  FaBell, 
  FaLock, 
  FaGlobe, 
  FaEnvelope,
  FaDatabase,
  FaPalette,
  FaTrash,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import SettingsService, { type SystemSettings } from '@/ApiServices/services/SettingsService';
import ContentSettingsService, { type ContentSettings } from '@/ApiServices/services/ContentSettingsService';
import DatabaseService, { type DatabaseStats } from '@/ApiServices/services/DatabaseService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Worklines ProConsulting',
    siteUrl: 'https://worklines.de',
    adminEmail: 'admin@worklines.de',
    portalUrl: 'https://portal.worklines.de',
    supportEmail: 'support@worklines.de',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD/MM/YYYY',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true
  });
  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    footerCompanyDescDe: '',
    footerCompanyDescTr: '',
    footerCompanyDescEn: '',
    footerCompanyDescAr: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedInUrl: '',
    aboutMissionText1De: '',
    aboutMissionText1Tr: '',
    aboutMissionText1En: '',
    aboutMissionText1Ar: '',
    aboutMissionText2De: '',
    aboutMissionText2Tr: '',
    aboutMissionText2En: '',
    aboutMissionText2Ar: '',
    contactPhone: '',
    contactEmail: '',
    addressGermany: '',
    addressTurkeyMersin: '',
    addressTurkeyIstanbul: ''
  });
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [includeUsers, setIncludeUsers] = useState(false);

  useEffect(() => {
    loadSettings();
    loadContentSettings();
    if (activeTab === 'system') {
      loadDatabaseStats();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const res = await SettingsService.getSettings();
      if (res.success && res.settings) {
        setSettings(prev => ({
          ...prev,
          siteName: res.settings!.siteName,
          siteUrl: res.settings!.siteUrl,
          adminEmail: res.settings!.adminEmail,
          portalUrl: res.settings!.portalUrl || 'https://portal.worklines.de',
          supportEmail: res.settings!.supportEmail || 'support@worklines.de'
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Hata',
        description: 'Ayarlar yüklenirken bir hata oluştu.',
        variant: 'destructive'
      });
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await DatabaseService.getStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading database stats:', error);
      toast({
        title: 'Hata',
        description: 'Veritabanı istatistikleri yüklenirken bir hata oluştu.',
        variant: 'destructive'
      });
    }
  };

  const handleCleanupTestData = async () => {
    try {
      setCleaningUp(true);
      const result = await DatabaseService.cleanupTestData(includeUsers);
      
      toast({
        title: 'Başarılı',
        description: result.message || 'Test verileri başarıyla temizlendi.',
        variant: 'default'
      });

      // Reload stats
      await loadDatabaseStats();
      setCleanupDialogOpen(false);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Test verileri temizlenirken bir hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setCleaningUp(false);
    }
  };

  const loadContentSettings = async () => {
    try {
      setLoading(true);
      const res = await ContentSettingsService.getSettings();
      if (res.success && res.settings) {
        setContentSettings(res.settings);
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (activeTab === 'general') {
      // Save general settings to backend
      try {
        setSaving(true);
        const res = await SettingsService.updateSettings({
          siteName: settings.siteName,
          siteUrl: settings.siteUrl,
          adminEmail: settings.adminEmail,
          portalUrl: settings.portalUrl,
          supportEmail: settings.supportEmail
        });
        if (res.success) {
          toast({
            title: 'Başarılı',
            description: 'Ayarlar başarıyla kaydedildi!',
          });
        } else {
          toast({
            title: 'Hata',
            description: res.error || 'Ayarlar kaydedilirken bir hata oluştu.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Hata',
          description: 'Ayarlar kaydedilirken bir hata oluştu.',
          variant: 'destructive'
        });
      } finally {
        setSaving(false);
      }
    } else if (activeTab === 'content') {
      // Save content settings to backend
      try {
        setSaving(true);
        const res = await ContentSettingsService.updateSettings({
          footerCompanyDescDe: contentSettings.footerCompanyDescDe,
          footerCompanyDescTr: contentSettings.footerCompanyDescTr,
          footerCompanyDescEn: contentSettings.footerCompanyDescEn,
          footerCompanyDescAr: contentSettings.footerCompanyDescAr,
          facebookUrl: contentSettings.facebookUrl,
          instagramUrl: contentSettings.instagramUrl,
          twitterUrl: contentSettings.twitterUrl,
          linkedInUrl: contentSettings.linkedInUrl,
          aboutMissionText1De: contentSettings.aboutMissionText1De,
          aboutMissionText1Tr: contentSettings.aboutMissionText1Tr,
          aboutMissionText1En: contentSettings.aboutMissionText1En,
          aboutMissionText1Ar: contentSettings.aboutMissionText1Ar,
          aboutMissionText2De: contentSettings.aboutMissionText2De,
          aboutMissionText2Tr: contentSettings.aboutMissionText2Tr,
          aboutMissionText2En: contentSettings.aboutMissionText2En,
          aboutMissionText2Ar: contentSettings.aboutMissionText2Ar,
          contactPhone: contentSettings.contactPhone,
          contactEmail: contentSettings.contactEmail,
          addressGermany: contentSettings.addressGermany,
          addressTurkeyMersin: contentSettings.addressTurkeyMersin,
          addressTurkeyIstanbul: contentSettings.addressTurkeyIstanbul
        });
        if (res.success) {
          toast({
            title: 'Başarılı',
            description: 'İçerik ayarları başarıyla kaydedildi!',
          });
        } else {
          toast({
            title: 'Hata',
            description: res.error || 'İçerik ayarları kaydedilirken bir hata oluştu.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error saving content settings:', error);
        toast({
          title: 'Hata',
          description: 'İçerik ayarları kaydedilirken bir hata oluştu.',
          variant: 'destructive'
        });
      } finally {
        setSaving(false);
      }
    } else {
      // For other tabs, just show a message (not implemented yet)
      toast({
        title: 'Bilgi',
        description: 'Bu ayarlar henüz backend\'e bağlı değil.',
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: <FaCog /> },
    { id: 'content', label: 'İçerik', icon: <FaPalette /> },
    { id: 'notifications', label: 'Bildirimler', icon: <FaBell /> },
    { id: 'security', label: 'Güvenlik', icon: <FaLock /> },
    { id: 'localization', label: 'Yerelleştirme', icon: <FaGlobe /> },
    { id: 'email', label: 'E-posta', icon: <FaEnvelope /> },
    { id: 'system', label: 'Sistem', icon: <FaDatabase /> },
    { id: 'appearance', label: 'Görünüm', icon: <FaPalette /> }
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors duration-300">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* General Settings */}
              {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Genel Ayarlar</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.siteUrl || ''}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Admin E-posta
                </label>
                <input
                  type="email"
                  value={settings.adminEmail || ''}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">E-posta Template Ayarları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Portal URL
                    </label>
                    <input
                      type="url"
                      value={settings.portalUrl || ''}
                      onChange={(e) => handleChange('portalUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="https://portal.worklines.de"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      E-posta template'lerinde {`{{PortalLink}}`} placeholder'ı için kullanılır
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Destek E-posta
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail || ''}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="support@worklines.de"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      E-posta template'lerinde {`{{SupportEmail}}`} placeholder'ı için kullanılır
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">İçerik Ayarları</h2>
              
              {/* Footer Company Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Footer - Şirket Açıklaması</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Almanca (De)</label>
                    <textarea
                      value={contentSettings.footerCompanyDescDe}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescDe: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türkçe (Tr)</label>
                    <textarea
                      value={contentSettings.footerCompanyDescTr}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescTr: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İngilizce (En)</label>
                    <textarea
                      value={contentSettings.footerCompanyDescEn || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescEn: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arapça (Ar)</label>
                    <textarea
                      value={contentSettings.footerCompanyDescAr || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescAr: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Sosyal Medya Linkleri</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook URL</label>
                    <input
                      type="url"
                      value={contentSettings.facebookUrl || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="https://facebook.com/worklines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={contentSettings.instagramUrl || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="https://instagram.com/worklines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter URL</label>
                    <input
                      type="url"
                      value={contentSettings.twitterUrl || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="https://twitter.com/worklines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={contentSettings.linkedInUrl || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, linkedInUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="https://linkedin.com/company/worklines"
                    />
                  </div>
                </div>
              </div>

              {/* About Mission Text */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hakkımızda - Misyon Metni (1. Paragraf)</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Almanca (De)</label>
                    <textarea
                      value={contentSettings.aboutMissionText1De}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1De: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türkçe (Tr)</label>
                    <textarea
                      value={contentSettings.aboutMissionText1Tr}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1Tr: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İngilizce (En)</label>
                    <textarea
                      value={contentSettings.aboutMissionText1En || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1En: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arapça (Ar)</label>
                    <textarea
                      value={contentSettings.aboutMissionText1Ar || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1Ar: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* About Mission Text 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hakkımızda - Misyon Metni (2. Paragraf)</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Almanca (De)</label>
                    <textarea
                      value={contentSettings.aboutMissionText2De}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2De: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türkçe (Tr)</label>
                    <textarea
                      value={contentSettings.aboutMissionText2Tr}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2Tr: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İngilizce (En)</label>
                    <textarea
                      value={contentSettings.aboutMissionText2En || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2En: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arapça (Ar)</label>
                    <textarea
                      value={contentSettings.aboutMissionText2Ar || ''}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2Ar: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">İletişim Bilgileri</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={contentSettings.contactPhone}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="+90 533 057 00 31"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
                    <input
                      type="email"
                      value={contentSettings.contactEmail}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      placeholder="info@worklines.de"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Almanya Adresi</label>
                    <textarea
                      value={contentSettings.addressGermany}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, addressGermany: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                      placeholder="Humboldstraße 25A, 21465 Reinbek&#10;22179 Hamburg&#10;Deutschland"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türkiye - Mersin Adresi</label>
                    <textarea
                      value={contentSettings.addressTurkeyMersin}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, addressTurkeyMersin: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={4}
                      placeholder="Cami Şerif Mahallesi&#10;İstiklal Caddesi 37/1&#10;Akdeniz, Mersin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türkiye - İstanbul Adresi</label>
                    <textarea
                      value={contentSettings.addressTurkeyIstanbul}
                      onChange={(e) => setContentSettings(prev => ({ ...prev, addressTurkeyIstanbul: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                      rows={5}
                      placeholder="Caferağa Mahallesi&#10;Moda Caddesi No:28/202 Kat 2&#10;Özgür İş Merkezi&#10;34710 Moda / Kadıköy - İstanbul"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Bildirim Ayarları</h2>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">E-posta Bildirimleri</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Önemli olaylar için e-posta bildirimleri al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">SMS Bildirimleri</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Acil durumlar için SMS bildirimleri al</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Push Bildirimleri</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Tarayıcı push bildirimleri</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Güvenlik Ayarları</h2>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">İki Faktörlü Kimlik Doğrulama</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Ekstra güvenlik katmanı ekle</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Oturum Zaman Aşımı (dakika)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout ?? ''}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Şifre Geçerlilik Süresi (gün)
                </label>
                <input
                  type="number"
                  value={settings.passwordExpiry ?? ''}
                  onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>
            </div>
          )}

          {/* Localization */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Yerelleştirme</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Dil
                </label>
                <select
                  value={settings.language || 'tr'}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Zaman Dilimi
                </label>
                <select
                  value={settings.timezone || 'Europe/Istanbul'}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                >
                  <option value="Europe/Istanbul">İstanbul</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Tarih Formatı
                </label>
                <select
                  value={settings.dateFormat || 'DD/MM/YYYY'}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Sistem Ayarları</h2>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Bakım Modu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Siteyi geçici olarak kapat</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Debug Modu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Geliştirme için hata ayıklama</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.debugMode}
                    onChange={(e) => handleChange('debugMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Cache Etkin</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Performans için önbellekleme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* Database Statistics */}
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Veritabanı İstatistikleri</h3>
                {dbStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Müşteriler</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dbStats.clients}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Belgeler</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dbStats.documents}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Başvurular</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dbStats.applications}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kullanıcılar</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dbStats.users}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                )}
              </div>

              {/* Test Data Cleanup */}
              <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Test Verilerini Temizle</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Bu işlem tüm test verilerini (müşteriler, belgeler, başvurular, form gönderimleri vb.) kalıcı olarak silecektir. 
                      Bu işlem geri alınamaz! Production veritabanında kullanmayın.
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeUsers}
                          onChange={(e) => setIncludeUsers(e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          Kullanıcıları da sil (Admin kullanıcıları korunur)
                        </span>
                      </label>
                    </div>
                    <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex items-center gap-2"
                          disabled={cleaningUp}
                        >
                          <FaTrash />
                          {cleaningUp ? 'Temizleniyor...' : 'Test Verilerini Temizle'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <FaExclamationTriangle />
                            Dikkat! Bu İşlem Geri Alınamaz
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>
                              Tüm test verileri kalıcı olarak silinecektir:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Müşteriler ve profilleri</li>
                              <li>Yüklenen belgeler</li>
                              <li>Başvurular ve adımları</li>
                              <li>Form gönderimleri</li>
                              <li>Destek talepleri</li>
                              <li>Email logları</li>
                              {includeUsers && <li>Kullanıcılar (Admin hariç)</li>}
                            </ul>
                            <p className="font-semibold text-red-600 mt-4">
                              Bu işlemi gerçekleştirmek istediğinizden emin misiniz?
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={cleaningUp}>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCleanupTestData}
                            disabled={cleaningUp}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cleaningUp ? 'Temizleniyor...' : 'Evet, Temizle'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading || saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

