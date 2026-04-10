import Breadcrumb from './Breadcrumb';
import { useLanguage } from '../../contexts/language-context';

interface BreadcrumbLink {
  href: string;
  text: string;
}

interface HeroSubProps {
  title: string;
  description?: string;
  breadcrumbLinks: BreadcrumbLink[];
}

const HeroSub = ({ title, description, breadcrumbLinks }: HeroSubProps) => {
  const { t } = useLanguage();

  return (
    <section className="text-center md:py-24 py-16 md:pt-44 pt-36 dark:bg-darkmode bg-white">
      <h2 className="dark:text-white md:text-[40px] leading-tight text-4xl font-bold text-midnight_text">
        {title}
      </h2>
      {description && (
        <p className="md:text-xl text-lg text-grey dark:text-white/50 font-normal max-w-3xl w-full mx-auto my-[1.875rem] sm:px-0 px-4">
          {description}
        </p>
      )}
      <Breadcrumb links={breadcrumbLinks} />
    </section>
  );
};

export default HeroSub;

