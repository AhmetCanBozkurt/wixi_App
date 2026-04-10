import { useLanguage } from '../../contexts/language-context';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

const ContactSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-section dark:bg-darklight py-16" id="contact">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="flex gap-2 items-center justify-center mb-4"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span className="font-medium text-midnight_text text-sm dark:text-white/50">
              {t('contact.badge') || 'get in touch'}
            </span>
          </div>
          <h2
            className="text-4xl font-bold text-midnight_text dark:text-white mb-6"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('contact.title') || 'Ready to get started?'}
          </h2>
          <p
            className="text-xl text-grey dark:text-white/70 mb-8"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('contact.description') || 'Get in touch with us and let\'s discuss how we can help your business grow.'}
          </p>
          <Button
            size="lg"
            asChild
            className="bg-primary text-white hover:bg-blue-700 px-8 py-3 rounded-lg"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="1000"
          >
            <Link to="/contact">
              {t('contact.cta') || 'Contact Us'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

