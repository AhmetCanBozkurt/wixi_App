import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Code, Cloud, Briefcase, Headphones, CheckCircle2 } from 'lucide-react';
import corporateService from '../../ApiServices/services/CorporateService';
import type { Service } from '../../ApiServices/services/CorporateService';
import { toast } from 'sonner';
import HeroSub from '../../components/corporate/HeroSub';
import ServicesSection from '../../components/corporate/ServicesSection';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Cloud,
  Briefcase,
  Headphones,
};

const CorporateServices = () => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/services', text: t('nav.services') || 'Hizmetlerimiz' },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await corporateService.getServices();
        if (result.success && result.data) {
          setServices(result.data);
        } else {
          toast.error(result.error || 'Hizmetler yüklenirken hata oluştu');
        }
      } catch (error) {
        toast.error('Hizmetler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getLocalizedText = (obj: { tr: string; en: string; es: string; fr: string; de: string }) => {
    const langMap: Record<string, keyof typeof obj> = { tr: 'tr', en: 'en', de: 'de', ar: 'en' };
    return obj[langMap[language] || 'tr'] || obj.tr;
  };

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('services.title') || 'Hizmetlerimiz'}
        description={t('services.subtitle') || 'İşinize değer katacak profesyonel yazılım çözümleri'}
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* Services List */}
      <section className="py-20 bg-white dark:bg-darkmode">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="space-y-16">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Code;
              return (
                <div
                  key={service.id}
                  id={service.key}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
                >
                  <div className="flex-1">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-midnight_text dark:text-white">{getLocalizedText(service.name)}</h2>
                    <p className="text-lg text-grey dark:text-white/70 mb-6">
                      {getLocalizedText(service.description)}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-midnight_text dark:text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <Card className="h-full bg-white dark:bg-darklight">
                      <CardHeader>
                        <CardTitle className="text-midnight_text dark:text-white">{getLocalizedText(service.name)}</CardTitle>
                        <CardDescription className="text-grey dark:text-white/70">{getLocalizedText(service.description)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <CheckCircle2 className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-midnight_text dark:text-white">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateServices;
