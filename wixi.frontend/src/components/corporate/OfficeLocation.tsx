import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';

const OfficeLocation = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary md:py-24 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div>
          <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 border-b border-solid border-white border-opacity-50 pb-11">
            <div className="col-span-3">
              <h2 className="text-white max-w-56 text-[40px] leading-tight font-bold">
                {t('contact.office.istanbul') || 'Istanbul Head Office'}
              </h2>
            </div>
            <div className="col-span-3">
              <p className="sm:text-2xl text-xl text-white/50 font-normal max-w-64 leading-7">
                {t('contact.office.istanbulAddress') || 'Istanbul, Turkey'}
              </p>
            </div>
            <div className="col-span-3">
              <Link
                to="mailto:info@wixisoftware.com"
                className="sm:text-2xl text-xl text-white font-medium underline block mb-2"
              >
                info@wixisoftware.com
              </Link>
              <Link
                to="tel:+902121234567"
                className="sm:text-2xl text-xl text-white/80 flex items-center gap-2 hover:text-opacity-100 w-fit"
              >
                <span className="text-white/40">Call</span>
                +90 (212) 123 45 67
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 pt-12">
            <div className="col-span-3">
              <h2 className="text-white max-w-52 text-[40px] leading-tight font-bold">
                {t('contact.office.germany') || 'Germany Office'}
              </h2>
            </div>
            <div className="col-span-3">
              <p className="sm:text-2xl text-xl text-white/50 font-normal max-w-64 leading-7">
                {t('contact.office.germanyAddress') || 'Germany'}
              </p>
            </div>
            <div className="col-span-3">
              <Link
                to="mailto:info@wixisoftware.com"
                className="sm:text-2xl text-xl text-white font-medium underline block mb-2"
              >
                info@wixisoftware.com
              </Link>
              <Link
                to="tel:+49123456789"
                className="sm:text-2xl text-white/80 text-xl flex items-center gap-2 hover:text-opacity-100 w-fit"
              >
                <span className="text-white/40">Call</span>
                +49 123 456 789
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfficeLocation;

