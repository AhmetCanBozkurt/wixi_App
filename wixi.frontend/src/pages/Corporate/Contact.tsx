import HeroSub from '../../components/corporate/HeroSub';
import ContactInfo from '../../components/corporate/ContactInfo';
import ContactForm from '../../components/corporate/ContactForm';
import OfficeLocation from '../../components/corporate/OfficeLocation';
import { useLanguage } from '../../contexts/language-context';

const CorporateContact = () => {
  const { t } = useLanguage();

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/contact', text: t('nav.contact') || 'İletişim' },
  ];

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('contact.title') || 'Contact Us'}
        description={t('contact.subtitle') || 'Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.'}
        breadcrumbLinks={breadcrumbLinks}
      />
      <ContactInfo />
      <ContactForm />
      <OfficeLocation />
    </div>
  );
};

export default CorporateContact;
