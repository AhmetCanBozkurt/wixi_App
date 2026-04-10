import { useLanguage } from '../contexts/language-context';
import { Wrench, Clock, Mail, Globe, Languages } from 'lucide-react';
import { useEffect, useState } from 'react';

const Maintenance = () => {
  // Bakım sayfası için özel dil yönetimi - her zaman Almanca ile başlar
  const [maintenanceLanguage, setMaintenanceLanguage] = useState<'de' | 'tr'>('de');
  const { setLanguage } = useLanguage();

  // Sayfa yüklendiğinde her zaman Almanca göster (localStorage'dan bağımsız)
  useEffect(() => {
    // İlk yüklemede Almanca'yı garanti et
    setMaintenanceLanguage('de');
  }, []);

  // Dil değiştirme fonksiyonu (sadece de <-> tr arasında geçiş)
  const toggleLanguage = () => {
    const newLang = maintenanceLanguage === 'de' ? 'tr' : 'de';
    setMaintenanceLanguage(newLang);
    // İsteğe bağlı: Global context'i de güncelle (ama bakım sayfası kendi state'ini kullanır)
    setLanguage(newLang);
  };

  const content = {
    tr: {
      title: 'Bakımdadır',
      subtitle: 'Sitemiz şu anda bakım çalışması yapılmaktadır',
      message: 'Yakında geri döneceğiz!',
      description: 'Sitemizi daha iyi hizmet verebilmek için güncelliyoruz. Lütfen daha sonra tekrar kontrol edin.',
      contact: 'Acil bir durum için bizimle iletişime geçebilirsiniz.',
      email: 'info@worklines.de'
    },
    de: {
      title: 'Wartung',
      subtitle: 'Unsere Website wird derzeit gewartet',
      message: 'Wir sind bald zurück!',
      description: 'Wir aktualisieren unsere Website, um Ihnen einen besseren Service zu bieten. Bitte versuchen Sie es später erneut.',
      contact: 'Bei dringenden Angelegenheiten können Sie uns kontaktieren.',
      email: 'info@worklines.de'
    },
    en: {
      title: 'Under Maintenance',
      subtitle: 'Our website is currently under maintenance',
      message: 'We\'ll be back soon!',
      description: 'We are updating our website to provide you with better service. Please check back later.',
      contact: 'For urgent matters, you can contact us.',
      email: 'info@worklines.de'
    },
    ar: {
      title: 'قيد الصيانة',
      subtitle: 'موقعنا قيد الصيانة حالياً',
      message: 'سنعود قريباً!',
      description: 'نقوم بتحديث موقعنا لتقديم خدمة أفضل. يرجى المحاولة لاحقاً.',
      contact: 'للأمور العاجلة، يمكنك الاتصال بنا.',
      email: 'info@worklines.de'
    }
  };

  // Bakım sayfası için sadece de veya tr kullan
  const displayLanguage = (maintenanceLanguage === 'de' ? 'de' : 'tr') as keyof typeof content;
  const texts = content[displayLanguage] || content.de;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full mb-4">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Worklines
          </h1>
        </div>

        {/* Language Toggle Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium"
            aria-label="Dil Değiştir"
          >
            <Languages className="w-5 h-5" />
            <span>{maintenanceLanguage === 'de' ? 'TR' : 'DE'}</span>
          </button>
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-blue-600 dark:bg-blue-500 rounded-full p-6">
              <Wrench className="w-16 h-16 text-white animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {texts.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              {texts.subtitle}
            </p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {texts.message}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-start space-x-4 mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 text-left">
                {texts.description}
              </p>
            </div>
            
            <div className="flex items-start space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {texts.contact}
                </p>
                <a 
                  href={`mailto:${texts.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline"
                >
                  {texts.email}
                </a>
              </div>
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center space-x-2 pt-4">
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Worklines. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;


