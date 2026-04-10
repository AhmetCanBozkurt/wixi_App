import { useLanguage } from '../../contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Target, Eye, Heart, Award, Users } from 'lucide-react';
import TeamSection from '../../components/corporate/TeamSection';
import HeroSub from '../../components/corporate/HeroSub';
import StatsSection from '../../components/corporate/StatsSection';
import WorkProgress from '../../components/corporate/WorkProgress';

const CorporateAbout = () => {
  const { t } = useLanguage();

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/about', text: t('nav.about') || 'Hakkımızda' },
  ];

  const values = [
    {
      icon: Target,
      title: t('about.values.innovation') || 'İnovasyon',
      description: t('about.values.innovationDesc') || 'Sürekli gelişen teknolojileri takip ediyoruz',
    },
    {
      icon: Heart,
      title: t('about.values.reliability') || 'Güvenilirlik',
      description: t('about.values.reliabilityDesc') || 'Müşterilerimize her zaman güvenilir hizmet sunuyoruz',
    },
    {
      icon: Users,
      title: t('about.values.customerFocus') || 'Müşteri Odaklılık',
      description: t('about.values.customerFocusDesc') || 'Müşterilerimizin başarısı bizim önceliğimiz',
    },
    {
      icon: Award,
      title: t('about.values.quality') || 'Kalite',
      description: t('about.values.qualityDesc') || 'Yüksek kalite standartlarını her zaman koruyoruz',
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('about.title') || 'About Us'}
        description={t('about.subtitle') || 'Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.'}
        breadcrumbLinks={breadcrumbLinks}
      />
      <StatsSection />
      <WorkProgress isColorMode={true} />

      {/* Mission & Vision */}
      <section className="py-20 bg-white dark:bg-darkmode">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-darklight">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-midnight_text dark:text-white">{t('about.mission') || 'Misyonumuz'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-grey dark:text-white/70">
                  {t('about.missionDesc') || 'Müşterilerimize en iyi yazılım çözümlerini sunarak, işletmelerin dijital dönüşümüne katkıda bulunmak ve teknoloji ile iş dünyasını birleştirmek.'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-darklight">
              <CardHeader>
                <Eye className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-midnight_text dark:text-white">{t('about.vision') || 'Vizyonumuz'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-grey dark:text-white/70">
                  {t('about.visionDesc') || 'Türkiye\'nin önde gelen SaaS platform sağlayıcısı olmak ve global pazarda tanınan bir teknoloji markası haline gelmek.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-section dark:bg-darklight">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-midnight_text dark:text-white">
              {t('about.values.title') || 'Değerlerimiz'}
            </h2>
            <p className="text-xl text-grey dark:text-white/70">
              {t('about.values.subtitle') || 'İş yapış şeklimizi belirleyen temel değerlerimiz'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-darklight">
                  <CardHeader>
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-midnight_text dark:text-white">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-grey dark:text-white/70">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />
    </div>
  );
};

export default CorporateAbout;
