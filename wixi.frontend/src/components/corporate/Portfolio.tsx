import PortfolioCard from './PortfolioCard';
import { useLanguage } from '../../contexts/language-context';

const Portfolio = () => {
  const { t } = useLanguage();

  return (
    <section id="portfolio" className="dark:bg-darkmode py-16">
      <div className="text-center lg:px-0 px-8">
        <div
          className="flex gap-2 items-center justify-center"
          data-aos="fade-right"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span className="font-medium text-midnight_text text-sm dark:text-white/50">
            {t('portfolio.badge') || 'Portfolio'}
          </span>
        </div>
        <h2
          className="sm:text-4xl text-[28px] leading-tight font-bold text-midnight_text text-center pt-7 pb-4 md:w-4/6 w-full m-auto dark:text-white"
          data-aos="fade-left"
          data-aos-delay="200"
          data-aos-duration="1000"
        >
          {t('portfolio.title') || 'Explore my portfolio showcase'}
        </h2>
        <div className="pb-14 inline-flex">
          <p className="text-base font-normal text-grey max-w-96 dark:text-white/50">
            {t('portfolio.description') || 'Dive into a curated collection of my finest work, showcasing expertise across various industries.'}
          </p>
        </div>
      </div>
      <PortfolioCard />
    </section>
  );
};

export default Portfolio;

