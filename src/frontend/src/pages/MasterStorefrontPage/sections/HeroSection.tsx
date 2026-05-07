import React from 'react';

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onRegisterClick }) => {
  return (
    <section className="landing-hero">
      <div className="landing-orb landing-orb-1" aria-hidden="true" />
      <div className="landing-orb landing-orb-2" aria-hidden="true" />

      <div className="landing-hero-content">
        <div className="landing-hero-badges">
          <span className="landing-hero-badge">14 gün ücretsiz deneme</span>
          <span className="landing-hero-badge">Kredi kartı gerekmez</span>
          <span className="landing-hero-badge">Kurulum 2 dakika</span>
        </div>

        <h1>
          <span className="landing-hero-h1-line">İşinizi</span>
          <span className="landing-hero-h1-line landing-hero-gradient-word">Geleceğe</span>
          <span className="landing-hero-h1-line">Taşıyın.</span>
        </h1>

        <p className="landing-hero-subtitle">
          Modüler yapısı ile E-Ticaret, CRM, Notlar ve Görev Takibini tek çatı altında
          yönetin. Türk KOBİ'leri için tasarlandı.
        </p>

        <div className="landing-hero-btns">
          <button className="landing-btn-primary" onClick={onRegisterClick}>
            Ücretsiz Deneyin →
          </button>
          <button className="landing-btn-ghost">
            ▷ Demo İzle
          </button>
        </div>
      </div>

      <div className="landing-hero-visual" aria-hidden="true">
        <div className="hero-float-card hero-float-card-1">
          E-Ticaret <span className="hero-float-card-check">✓</span>
        </div>
        <div className="hero-float-card hero-float-card-2">
          CRM <span className="hero-float-card-check">✓</span>
        </div>
        <div className="hero-float-card hero-float-card-3">
          <div className="hero-float-card-stats">
            <strong>1,250+ Mağaza</strong>
            <span>₺4.5M+ İşlem</span>
          </div>
        </div>
      </div>
    </section>
  );
};
