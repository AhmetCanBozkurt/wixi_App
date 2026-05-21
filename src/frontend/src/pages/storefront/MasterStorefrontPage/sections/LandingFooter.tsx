import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-grid">
        <div className="landing-footer-brand">
          <span className="landing-footer-brand-logo">
            WIXI<span className="logo-app">APP</span>
          </span>
          <p className="landing-footer-brand-tagline">
            Türk KOBİ'leri için modüler SaaS yönetim platformu. E-Ticaret, CRM,
            Notlar ve daha fazlası tek çatı altında.
          </p>
        </div>

        <div className="landing-footer-col">
          <h4>Ürün</h4>
          <ul className="landing-footer-links">
            <li><a href="#features">Özellikler</a></li>
            <li><a href="#pricing">Fiyatlandırma</a></li>
            <li><a href="#">Değişiklik Günlüğü</a></li>
          </ul>
        </div>

        <div className="landing-footer-col">
          <h4>Şirket</h4>
          <ul className="landing-footer-links">
            <li><a href="#">Hakkımızda</a></li>
            <li><a href="#">İletişim</a></li>
            <li><a href="#">Gizlilik Politikası</a></li>
          </ul>
        </div>

        <div className="landing-footer-col">
          <h4>Destek</h4>
          <ul className="landing-footer-links">
            <li><a href="#">Dokümantasyon</a></li>
            <li><a href="#faq">SSS</a></li>
            <li><a href="#">Destek Talebi</a></li>
          </ul>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <span className="landing-footer-copy">
          &copy; {new Date().getFullYear()} WixiApp SaaS Platform. Tüm hakları saklıdır.
        </span>
        <div className="landing-footer-legal">
          <a href="#">KVKK</a>
          <a href="#">Gizlilik Politikası</a>
        </div>
      </div>
    </footer>
  );
};
