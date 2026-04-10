import React from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/language-context';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

const Privacy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('legal.back_home')}
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t('legal.privacy_title')}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{t('legal.privacy_subtitle')}</p>
          </div>

          <div className="bg-card rounded-lg border p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground border-b pb-2">{t('legal.privacy.data_collection')}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t('legal.privacy.data_collection_text')}</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground border-b pb-2">{t('legal.privacy.personal_data')}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t('legal.privacy.personal_data_text')}</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground border-b pb-2">{t('legal.privacy.data_processing')}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t('legal.privacy.data_processing_text')}</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground border-b pb-2">{t('legal.privacy.cookies')}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t('legal.privacy.cookies_text')}</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground border-b pb-2">{t('legal.privacy.your_rights')}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{t('legal.privacy.your_rights_text')}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;


