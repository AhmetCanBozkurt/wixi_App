import React, { useState, useEffect } from 'react';
import { FaSave, FaEnvelope, FaServer, FaKey } from 'react-icons/fa';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
import { useToast } from '../../hooks/use-toast';

interface SmtpSettingsData {
  id?: number;
  host: string;
  port: number;
  useSsl: boolean;
  userName: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  timeoutMs?: number;
  retryCount: number;
  updatedAt?: string;
  updatedBy?: string;
}

const SmtpSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SmtpSettingsData>({
    host: '',
    port: 587,
    useSsl: true,
    userName: '',
    password: '',
    fromName: '',
    fromEmail: '',
    timeoutMs: 30000,
    retryCount: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testTemplateKey, setTestTemplateKey] = useState<string>('');
  const [templates, setTemplates] = useState<Array<{ key: string; description?: string }>>([]);

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) return;

      const response = await fetch(API_ROUTES.EMAIL_TEMPLATES.BASE, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        // Backend returns { success: true, items: [...] }
        const templatesArray = Array.isArray(result) ? result : (result.items || []);
        setTemplates(templatesArray.map((t: any) => ({ 
          key: t.key || t.Key || '', 
          description: t.description || t.Description || '' 
        })));
      }
    } catch (error) {
      console.error('Template\'ler yüklenemedi:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: '❌ Token bulunamadı. Lütfen tekrar giriş yapın.'
        });
        setLoading(false);
        return;
      }

      const response = await fetch(API_ROUTES.ADMIN.EMAIL_SETTINGS, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data,
          password: '' // Don't show existing password
        });
      }
    } catch (error) {
      console.error('SMTP ayarları yüklenemedi:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: '❌ SMTP ayarları yüklenemedi'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: '❌ Token bulunamadı. Lütfen tekrar giriş yapın.'
        });
        setSaving(false);
        return;
      }

      const response = await fetch(API_ROUTES.ADMIN.EMAIL_SETTINGS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Başarılı',
          description: '✅ SMTP ayarları başarıyla kaydedildi!'
        });
        await loadSettings();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: '❌ SMTP ayarları kaydedilemedi'
        });
      }
    } catch (error) {
      console.error('SMTP ayarları kaydedilemedi:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: '❌ SMTP ayarları kaydedilemedi'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: '❌ Lütfen test email adresi girin'
      });
      return;
    }

    setTesting(true);

    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: '❌ Token bulunamadı. Lütfen tekrar giriş yapın.'
        });
        setTesting(false);
        return;
      }

      const response = await fetch(API_ROUTES.ADMIN.EMAIL_TEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: testEmail,
          templateKey: testTemplateKey || undefined,
          subject: testTemplateKey ? undefined : 'Test Email from Worklines',
          body: testTemplateKey ? undefined : 'Bu bir test emailidir. SMTP ayarlarınız düzgün çalışıyor!'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Başarılı',
          description: `✅ Test email ${testEmail} adresine gönderildi!`
        });
        setTestEmail('');
      } else {
        const error = await response.json();
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: `❌ ${error.message || 'Test email gönderilemedi'}`
        });
      }
    } catch (error) {
      console.error('Test email gönderilemedi:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: '❌ Test email gönderilemedi'
      });
    } finally {
      setTesting(false);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4 max-w-4xl transition-colors duration-300">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          <FaServer className="text-purple-600 dark:text-purple-400" />
          Sunucu Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              SMTP Host *
            </label>
            <input
              type="text"
              value={settings.host}
              onChange={(e) => setSettings({ ...settings, host: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              placeholder="smtp.example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Port *
            </label>
            <input
              type="number"
              value={settings.port}
              onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useSsl"
              checked={settings.useSsl}
              onChange={(e) => setSettings({ ...settings, useSsl: e.target.checked })}
              className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-colors duration-300"
            />
            <label htmlFor="useSsl" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
              SSL/TLS Kullan (Önerilen)
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4 max-w-4xl transition-colors duration-300">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          <FaKey className="text-purple-600 dark:text-purple-400" />
          Kimlik Doğrulama
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Kullanıcı Adı *
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Şifre {settings.id && '(Boş bırakın mevcut şifreyi değiştirmemek için)'}
            </label>
            <input
              type="password"
              value={settings.password}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4 max-w-4xl transition-colors duration-300">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          <FaEnvelope className="text-purple-600 dark:text-purple-400" />
          Gönderici Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Gönderici Adı *
            </label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              placeholder="Worklines"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Gönderici Email *
            </label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              placeholder="noreply@worklines.de"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Timeout (ms)
            </label>
            <input
              type="number"
              value={settings.timeoutMs}
              onChange={(e) => setSettings({ ...settings, timeoutMs: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Tekrar Deneme Sayısı
            </label>
            <input
              type="number"
              value={settings.retryCount}
              onChange={(e) => setSettings({ ...settings, retryCount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
              min="1"
              max="5"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4 max-w-4xl transition-colors duration-300">
        <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-100 transition-colors duration-300">Test Email Gönder</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              placeholder="test@example.com"
            />
            <button
              onClick={handleTestEmail}
              disabled={testing}
              className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <FaEnvelope />
                  Test Gönder
                </>
              )}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Template Kullan (Opsiyonel)
            </label>
            <select
              value={testTemplateKey}
              onChange={(e) => setTestTemplateKey(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
            >
              <option value="">Template kullanma (basit test email)</option>
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.key === 'ContactForm' ? '📝 Kontakt Formuları' : 
                   t.key === 'EmployerForm' ? '🏢 Arbeitgeber Formuları' : 
                   t.key === 'EmployeeForm' ? '👤 Arbeitnehmer Formuları' : t.key}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
              Template seçilirse, sample data ile template gönderilir
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {settings.updatedAt && (
            <p>Son güncelleme: {new Date(settings.updatedAt).toLocaleString('tr-TR')} 
              {settings.updatedBy && ` - ${settings.updatedBy}`}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2 font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <FaSave />
              Ayarları Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SmtpSettings;

