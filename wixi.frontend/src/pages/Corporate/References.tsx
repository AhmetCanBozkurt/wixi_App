import HeroSub from '../../components/corporate/HeroSub';
import PortfolioList from '../../components/corporate/PortfolioList';
import { useLanguage } from '../../contexts/language-context';

const CorporateReferences = () => {
  const { t } = useLanguage();

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/references', text: t('nav.references') || 'Referanslar' },
  ];

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('references.title') || 'Portfolio'}
        description={t('references.subtitle') || 'Dive into a curated collection of my finest work, showcasing expertise across various industries.'}
        breadcrumbLinks={breadcrumbLinks}
      />
      <PortfolioList />
    </div>
  );
};

export default CorporateReferences;
