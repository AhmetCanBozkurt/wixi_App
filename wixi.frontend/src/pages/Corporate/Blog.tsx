import HeroSub from '../../components/corporate/HeroSub';
import BlogList from '../../components/corporate/BlogList';
import { useLanguage } from '../../contexts/language-context';

const CorporateBlog = () => {
  const { t } = useLanguage();

  const breadcrumbLinks = [
    { href: '/', text: t('nav.home') || 'Ana Sayfa' },
    { href: '/blog', text: t('nav.blog') || 'Blog' },
  ];

  return (
    <div className="min-h-screen">
      <HeroSub
        title={t('blog.title') || 'Blog'}
        description={t('blog.subtitle') || 'Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.'}
        breadcrumbLinks={breadcrumbLinks}
      />
      <BlogList />
    </div>
  );
};

export default CorporateBlog;
