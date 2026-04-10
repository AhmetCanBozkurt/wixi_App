import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CorporateHeader from '../corporate/CorporateHeader';
import CorporateFooter from '../corporate/CorporateFooter';

const CorporateLayout = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <CorporateHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CorporateFooter />
    </div>
  );
};

export default CorporateLayout;

