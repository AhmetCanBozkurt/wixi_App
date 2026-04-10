import React from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/language-context';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

const Impressum: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('legal.back_home')}
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">{t('legal.impressum_title')}</h1>
            <p className="text-muted-foreground text-lg">{t('legal.impressum_subtitle')}</p>
          </div>

          <div className="bg-card rounded-lg border p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.company_info')}</h2>
              <div className="space-y-2">
                <p className="text-foreground">
                  <span className="font-medium">{t('legal.impressum.company_name')}</span>
                </p>
                <p className="text-muted-foreground ml-4">Worklines Proconsulting</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.address')}</h2>
              <div className="space-y-1 text-muted-foreground ml-4">
                <p className="font-medium text-foreground">Deutschland:</p>
                <p>Humboldstraβe 25A,21465 Reinbek</p>
                <p>22179 Hamburg</p>
                <p>Deutschland</p>
              </div>
              <div className="space-y-1 text-muted-foreground ml-4 mt-4">
                <p className="font-medium text-foreground">Türkiye - Mersin:</p>
                <p>Cami Şerif Mahallesi</p>
                <p>Istiklal Caddesi 37 / 1</p>
                <p>Akdeniz, Mersin</p>
              </div>
              <div className="space-y-1 text-muted-foreground ml-4 mt-4">
                <p className="font-medium text-foreground">Türkiye - Istanbul:</p>
                <p>Caferağa Mahallesi</p>
                <p>Moda Caddesi No:28/202 Kat 2</p>
                <p>Özgür Iş Merkezi</p>
                <p>34710 Moda / Kadıköy - Istanbul</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.contact')}</h2>
              <div className="space-y-2 ml-4">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{t('legal.impressum.phone')}</span> +90 533 057 00 31
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{t('legal.impressum.email')}</span> <a href="mailto:info@worklines.com" className="text-primary hover:underline">info@worklines.com</a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.managing_director')}</h2>
              <p className="text-muted-foreground ml-4">Inna Moor</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.commercial_register')}</h2>
              <div className="space-y-2 ml-4">
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{t('legal.impressum.register_court')}</span> Amtsgericht Berlin</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{t('legal.impressum.register_number')}</span> HRB 123456</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.vat_id')}</h2>
              <p className="text-muted-foreground ml-4"><span className="font-medium text-foreground">{t('legal.impressum.vat_law')}</span> DE123456789</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.content_responsible')}</h2>
              <p className="text-muted-foreground ml-4"><span className="font-medium text-foreground">{t('legal.impressum.content_law')}</span></p>
              <div className="space-y-1 text-muted-foreground ml-8">
                <p>Inna Moor</p>
                <p>Haldesdorfer Straße 138</p>
                <p>22179 Hamburg, Deutschland</p>
              </div>
              <div className="space-y-1 text-muted-foreground ml-8 mt-3">
                <p>Cami Şerif Mahallesi, Istiklal Caddesi 37 / 1</p>
                <p>Akdeniz, Mersin, Türkiye</p>
              </div>
              <div className="space-y-1 text-muted-foreground ml-8 mt-3">
                <p>Caferağa Mahallesi, Moda Caddesi No:28/202 Kat 2</p>
                <p>Özgür Iş Merkezi, 34710 Moda / Kadıköy - Istanbul, Türkiye</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground border-b pb-2">{t('legal.impressum.disclaimer')}</h2>
              <p className="text-muted-foreground ml-4 leading-relaxed">{t('legal.impressum.disclaimer_text')}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Impressum;


