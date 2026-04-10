import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative md:pt-44 pt-28 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-900 dark:via-purple-900 dark:to-blue-950 text-white min-h-screen flex items-center">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10 dark:opacity-5"></div>
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-12 gap-4 relative z-10">
        <div
          className="md:col-span-6 col-span-12 p-4 md:px-4 px-0 space-y-4 flex flex-col items-start justify-center"
          data-aos="fade-right"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          <div className="flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span className="font-medium text-white/90 text-sm">
              {t('hero.badge') || 'build everything'}
            </span>
          </div>
          <h1 className="text-white font-bold text-4xl md:text-5xl md:leading-[1.15]">
            {t('hero.title') || 'Yazılım Çözümleriyle İşinizi Büyütün'}
          </h1>
          <p className="text-white/90 text-xl font-semibold">
            {t('hero.subtitle') || 'Modern, ölçeklenebilir ve güvenli SaaS platformları ile işinize değer katın'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              size="lg"
              asChild
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-lg"
            >
              <Link to="/solutions">
                {t('hero.cta.solutions') || 'Çözümlerimizi Keşfedin'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg"
            >
              <Link to="/contact">
                {t('hero.cta.contact') || 'İletişime Geçin'}
              </Link>
            </Button>
          </div>
          <div className="flex items-center mt-12 gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-500 -ml-0"></div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-green-500 to-teal-500 -ml-3"></div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-red-500 -ml-3"></div>
            </div>
            <div>
              <p className="text-sm font-normal text-white/90 max-w-56">
                {t('hero.help') || 'Yardıma mı ihtiyacınız var?'}{' '}
                <Link to="/contact" className="text-white hover:text-white/80 underline">
                  {t('hero.help.link') || 'Uzmanlarımızla iletişime geçin'}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 col-span-12 relative">
          <div className="relative w-full h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="aspect-square bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-white">100+</div>
                  <div className="text-xl text-white/80">{t('hero.stats.projects') || 'Başarılı Proje'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
