import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { useEffect, useState } from 'react';
import projectReferenceService from '../../ApiServices/services/ProjectReferenceService';
import { toast } from 'sonner';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface PortfolioItem {
  id: number;
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  documentImageUrl?: string;
  clientName?: string;
}

const PortfolioCard = () => {
  const { t, language } = useLanguage();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await projectReferenceService.getPublicProjectReferences(10);
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

  const settings = {
    autoplay: true,
    dots: false,
    arrows: false,
    infinite: true,
    speed: 100,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="dark:bg-darkmode py-8">
        <div className="lg:px-9 m-auto px-0 max-w-[1600px]">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="portfolio" className="dark:bg-darkmode">
      <div className="lg:px-9 m-auto px-0 max-w-[1600px] slider-container">
        <Slider {...settings}>
          {portfolioItems.map((item, index) => (
            <Link key={item.id} to={`/references#${item.id}`}>
              <div
                className={`px-3 group ${index % 2 !== 0 ? 'lg:mt-24 ' : ''}`}
              >
                <div className="relative overflow-hidden rounded-lg">
                  {item.documentImageUrl ? (
                    <img
                      src={item.documentImageUrl}
                      alt={getLocalizedText(item)}
                      className="w-full h-auto group-hover:scale-110 group-hover:cursor-pointer transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {getLocalizedText(item).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="pb-1 pt-9 group-hover:text-primary group-hover:cursor-pointer text-2xl text-midnight_text font-bold dark:text-white">
                  {getLocalizedText(item)}
                </h4>
                <p className="text-secondary font-normal text-lg group-hover:text-primary group-hover:cursor-pointer dark:text-white/50">
                  {item.clientName || t('portfolio.designation') || 'Designation'}
                </p>
              </div>
            </Link>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default PortfolioCard;

