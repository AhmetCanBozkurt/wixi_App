import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Layers, Key, Puzzle, CheckCircle2, ArrowRight } from 'lucide-react';
import corporateService from '../../ApiServices/services/CorporateService';
import type { Solution } from '../../ApiServices/services/CorporateService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import HeroSub from '../../components/corporate/HeroSub';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Key,
  Puzzle,
};

const CorporateSolutions = () => {
  const { t, language } = useLanguage();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/solutions', text: t('nav.solutions') || 'Çözümlerimiz' },
  ];

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const result = await corporateService.getSolutions();
        if (result.success && result.data) {
          setSolutions(result.data);
        } else {
          toast.error(result.error || 'Çözümler yüklenirken hata oluştu');
        }
      } catch (error) {
        toast.error('Çözümler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, []);

  const getLocalizedText = (obj: { tr: string; en: string; es: string; fr: string; de: string }) => {
    const langMap: Record<string, keyof typeof obj> = { tr: 'tr', en: 'en', de: 'de', ar: 'en' };
    return obj[langMap[language] || 'tr'] || obj.tr;
  };

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('solutions.title') || 'Çözümlerimiz'}
        description={t('solutions.subtitle') || 'İşinize özel, ölçeklenebilir ve güvenli yazılım çözümleri'}
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* Solutions List */}
      <section className="py-20 bg-white dark:bg-darkmode">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {solutions.map((solution) => {
              const Icon = iconMap[solution.icon] || Layers;
              return (
                <Card key={solution.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-darklight">
                  <CardHeader>
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-midnight_text dark:text-white">{getLocalizedText(solution.name)}</CardTitle>
                    <CardDescription className="text-base text-grey dark:text-white/70">
                      {getLocalizedText(solution.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {solution.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-midnight_text dark:text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/contact">
                        {t('solutions.learnMore') || 'Daha Fazla Bilgi'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateSolutions;
