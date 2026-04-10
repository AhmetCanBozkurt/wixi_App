import HeroSection from '../../components/corporate/HeroSection';
import ServicesSection from '../../components/corporate/ServicesSection';
import StatsSection from '../../components/corporate/StatsSection';
import WorkProgress from '../../components/corporate/WorkProgress';
import Portfolio from '../../components/corporate/Portfolio';
import TestimonialsSection from '../../components/corporate/TestimonialsSection';
import BlogSection from '../../components/corporate/BlogSection';
import ContactSection from '../../components/corporate/ContactSection';

const CorporateHome = () => {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <WorkProgress isColorMode={false} />
      <ServicesSection />
      <Portfolio />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </div>
  );
};

export default CorporateHome;
