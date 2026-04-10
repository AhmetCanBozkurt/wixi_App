import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Star } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import testimonialService from '../../ApiServices/services/TestimonialService';
import { toast } from 'sonner';

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  company?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating?: number;
  imageUrl?: string;
}

const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialService.getPublicTestimonials(6);
        setTestimonials(data);
      } catch (error) {
        toast.error('Referanslar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const getLocalizedText = (obj?: {
    tr?: string;
    de?: string;
    en?: string;
    ar?: string;
  }) => {
    if (!obj) return '';
    return obj[language as keyof typeof obj] || obj.tr || '';
  };

  if (loading) {
    return (
      <section className="scroll-mt-24 bg-section dark:bg-darklight border-none py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="h-52 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-8"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show first testimonial in Venus style
  const featuredTestimonial = testimonials[0];

  if (!featuredTestimonial) {
    return null;
  }

  return (
    <section
      className="scroll-mt-24 bg-section dark:bg-darklight border-none py-16"
      id="testimonials"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div>
          <div className="pt-16 pb-28">
            <p className="font-medium md:text-xl text-base text-midnight_text dark:text-white text-center max-w-3xl mx-auto">
              "{getLocalizedText({
                tr: featuredTestimonial.content,
                de: featuredTestimonial.contentDe,
                en: featuredTestimonial.contentEn,
                ar: featuredTestimonial.contentAr,
              })}"
            </p>
          </div>
          <div className="text-center">
            <strong className="text-lg font-bold text-midnight_text dark:text-primary">
              {featuredTestimonial.name}
            </strong>
            <p className="text-base text-gray dark:text-white/50">
              {featuredTestimonial.role}
              {featuredTestimonial.role && featuredTestimonial.company && ` ${t('testimonials.at') || 'at'} `}
              {featuredTestimonial.company}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
