import React, { useEffect, useRef, useState } from 'react';

interface DashboardPreviewProps {
  onRegisterClick: () => void;
}

export const DashboardPreviewSection: React.FC<DashboardPreviewProps> = ({ onRegisterClick }) => {
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="landing-dashboard">
      <div className="landing-dashboard-grid">
        <div className="landing-dashboard-left">
          <span className="landing-dashboard-left-tag">Güçlü Platform</span>
          <h2>Güçlü Yönetim Panosu</h2>
          <p>
            Tüm operasyonlarınızı tek ekrandan takip edin. Gerçek zamanlı satış
            verileri, müşteri metrikleri ve görev durumlarını anlık olarak görün.
          </p>
          <ul className="landing-dashboard-bullets">
            <li>
              <span className="landing-dashboard-bullet-dot" />
              Anlık satış ve stok durumu
            </li>
            <li>
              <span className="landing-dashboard-bullet-dot" />
              Ekip görevleri ve ilerleme takibi
            </li>
            <li>
              <span className="landing-dashboard-bullet-dot" />
              Müşteri segmentasyonu ve raporlar
            </li>
          </ul>
          <button className="landing-btn-primary" onClick={onRegisterClick}>
            Ücretsiz Deneyin →
          </button>
        </div>

        <div
          ref={frameRef}
          className={`landing-browser-frame${inView ? ' in-view' : ''}`}
          aria-label="Dashboard önizlemesi"
        >
          <div className="landing-browser-chrome">
            <div className="landing-browser-dot landing-browser-dot-red" />
            <div className="landing-browser-dot landing-browser-dot-yellow" />
            <div className="landing-browser-dot landing-browser-dot-green" />
            <div className="landing-browser-url" />
          </div>

          <div className="landing-browser-body">
            <div className="landing-browser-sidebar">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="landing-browser-sidebar-dot" />
              ))}
            </div>

            <div className="landing-browser-main">
              <div className="landing-browser-stat-row">
                <div className="landing-browser-stat-card" />
                <div className="landing-browser-stat-card" />
                <div className="landing-browser-stat-card" />
              </div>
              <div className="landing-browser-content-row" />
              <div className="landing-browser-content-row medium" />
              <div className="landing-browser-content-row short" />
              <div className="landing-browser-content-row" />
              <div className="landing-browser-content-row medium" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
