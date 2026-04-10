import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';

const WhyUsSection = () => {
  const { t } = useLanguage();

  const features = [
    { key: 'experience', text: t('whyus.experience') || '10+ Yıllık Deneyim' },
    { key: 'projects', text: t('whyus.projects') || '100+ Başarılı Proje' },
    { key: 'support', text: t('whyus.support') || '7/24 Teknik Destek' },
    { key: 'technology', text: t('whyus.technology') || 'Modern Teknolojiler' },
    { key: 'security', text: t('whyus.security') || 'Güvenli ve Ölçeklenebilir' },
    { key: 'quality', text: t('whyus.quality') || 'Yüksek Kalite Standartları' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('whyus.title') || 'Neden Wixi Software?'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('whyus.subtitle') || 'İşinizi büyütmek için ihtiyacınız olan her şey'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.key} className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;

