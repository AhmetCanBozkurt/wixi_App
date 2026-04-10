import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { NewsSlider } from '../components/news-slider';
import { CTASection } from '../components/cta-section';
import { Footer } from '../components/footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <NewsSlider />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
