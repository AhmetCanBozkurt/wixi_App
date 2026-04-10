import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Code, Cloud, Briefcase, Headphones, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { useEffect, useState } from 'react';
import corporateService from '../../ApiServices/services/CorporateService';
import type { Service } from '../../ApiServices/services/CorporateService';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Cloud,
  Briefcase,
  Headphones,
};

const ServicesSection = () => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="bg-section dark:bg-darklight py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex gap-2 items-center justify-center mb-7">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span className="font-medium text-midnight_text text-sm dark:text-white/50">
              {t('services.badge') || 'our services'}
            </span>
          </div>
          <div className="grid md:grid-cols-12 sm:grid-cols-8 grid-cols-1 gap-7">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="col-span-4 bg-white dark:bg-darkmode shadow-service rounded-md animate-pulse">
                <CardHeader className="text-center py-14 px-7">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-section dark:bg-darklight py-16" id="services">
      <div className="container mx-auto max-w-6xl px-4">
        <div
          className="flex gap-2 items-center justify-center"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span className="font-medium text-midnight_text text-sm dark:text-white/50">
            {t('services.badge') || 'our services'}
          </span>
        </div>
        <h2
          className="sm:text-4xl text-[28px] leading-tight font-bold text-midnight_text md:text-center text-start pt-7 pb-20 md:w-4/6 w-full m-auto dark:text-white"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          {t('services.title') || 'Services specifically designed to meet your business needs'}
        </h2>
        <div className="grid md:grid-cols-12 sm:grid-cols-8 grid-cols-1 gap-7">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <div
                key={service.id}
                data-aos="fade-up"
                data-aos-delay={`${index * 200}`}
                data-aos-duration="1000"
                data-aos-offset="300"
                className="col-span-4 bg-white dark:bg-darkmode flex flex-col justify-between items-center text-center py-14 px-7 shadow-service rounded-md gap-8"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="max-w-44 mx-auto text-2xl font-bold text-midnight_text dark:text-white">
                  {getLocalizedText(service.name)}
                </h3>
                <p className="dark:text-white/50 text-base font-normal text-grey">
                  {getLocalizedText(service.description)}
                </p>
                <Link
                  to={`/services#${service.key}`}
                  className="hover:text-blue-700 text-lg font-medium text-primary group flex items-center"
                >
                  {t('services.getStarted') || 'Get Started'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
