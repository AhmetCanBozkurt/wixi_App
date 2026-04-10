import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { useEffect, useState } from 'react';
import projectReferenceService from '../../ApiServices/services/ProjectReferenceService';
import { toast } from 'sonner';

interface PortfolioItem {
  id: number;
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  documentImageUrl?: string;
  clientName?: string;
}

const PortfolioList = () => {
  const { t, language } = useLanguage();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await projectReferenceService.getPublicProjectReferences();
        setPortfolioItems(data);
      } catch (error) {
        toast.error('Portfolio yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const getLocalizedText = (item: PortfolioItem) => {
    const textMap: Record<string, string> = {
      tr: item.title,
      de: item.titleDe || item.title,
      en: item.titleEn || item.title,
      ar: item.titleAr || item.title,
    };
    return textMap[language] || item.title;
  };

  if (loading) {
    return (
      <section className="md:pb-24 pb-16 pt-8 dark:bg-darkmode">
        <div className="flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[18rem] h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="md:pb-24 pb-16 pt-8 dark:bg-darkmode">
      <div className="flex flex-wrap gap-[2.125rem] lg:px-[2.125rem] px-0 max-w-[120rem] w-full justify-center m-auto">
        {portfolioItems.map((item, index) => (
          <Link key={item.id} to={`/references#${item.id}`}>
            <div className={`w-[18rem] group ${index % 3 === 1 ? 'md:mt-24' : index % 3 === 2 ? 'md:mt-0' : 'md:mt-0'}`}>
              <div className="relative overflow-hidden rounded-lg group-hover:scale-[1.1] group-hover:cursor-pointer transition-all duration-500">
                {item.documentImageUrl ? (
                  <img
                    src={item.documentImageUrl}
                    alt={getLocalizedText(item)}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {getLocalizedText(item).charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h4 className="pb-[0.3125rem] pt-[2.1875rem] group-hover:text-primary group-hover:cursor-pointer text-2xl text-midnight_text font-bold dark:text-white">
                {getLocalizedText(item)}
              </h4>
              <p className="text-secondary font-normal text-lg group-hover:text-primary group-hover:cursor-pointer dark:text-white/50">
                {item.clientName || t('portfolio.designation') || 'Designation'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PortfolioList;

