import React, { useState } from 'react';
import './MasterStorefrontPage.css';
import { LandingHeader } from './sections/LandingHeader';
import { HeroSection } from './sections/HeroSection';
import { StatsBar } from './sections/StatsBar';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { DashboardPreviewSection } from './sections/DashboardPreviewSection';
import { PricingSection } from './sections/PricingSection';
import { FAQSection } from './sections/FAQSection';
import { LandingFooter } from './sections/LandingFooter';
import { RegisterModal } from './components/RegisterModal';

export const MasterStorefrontPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);

  const handleRegisterClick = (planId?: string) => {
    setSelectedPlan(planId);
    setShowRegister(true);
  };

  return (
    <div className="wixi-landing">
      <LandingHeader onRegisterClick={() => handleRegisterClick()} />
      <main>
        <HeroSection onRegisterClick={() => handleRegisterClick()} />
        <StatsBar />
        <FeaturesSection />
        <HowItWorksSection onRegisterClick={() => handleRegisterClick()} />
        <DashboardPreviewSection onRegisterClick={() => handleRegisterClick()} />
        <PricingSection onRegisterClick={handleRegisterClick} />
        <FAQSection />
      </main>
      <LandingFooter />
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};
