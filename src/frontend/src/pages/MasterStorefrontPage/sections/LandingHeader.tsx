import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LandingHeaderProps {
  onRegisterClick: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onRegisterClick }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="landing-header">
        <a href="#" className="landing-header-logo" aria-label="WixiApp home">
          WIXI<span className="logo-app">APP</span>
        </a>

        <nav className="landing-header-nav" aria-label="Primary navigation">
          <a href="#features">Özellikler</a>
          <a href="#pricing">Fiyatlandırma</a>
          <a href="#how-it-works">Nasıl Çalışır?</a>
          <a href="#faq">SSS</a>
          <Link to="/login" className="landing-btn-ghost">
            Giriş Yap
          </Link>
          <button className="landing-btn-cta" onClick={onRegisterClick}>
            Hemen Başla
          </button>
        </nav>

        <button
          className="landing-header-hamburger"
          aria-label="Menüyü aç/kapat"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <nav
        className={`landing-header-mobile-nav${mobileOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
      >
        <a href="#features" onClick={() => setMobileOpen(false)}>Özellikler</a>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Fiyatlandırma</a>
        <a href="#how-it-works" onClick={() => setMobileOpen(false)}>Nasıl Çalışır?</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>SSS</a>
        <Link
          to="/login"
          className="landing-btn-ghost"
          onClick={() => setMobileOpen(false)}
        >
          Giriş Yap
        </Link>
        <button
          className="landing-btn-cta"
          onClick={() => { setMobileOpen(false); onRegisterClick(); }}
        >
          Hemen Başla
        </button>
      </nav>
    </>
  );
};
