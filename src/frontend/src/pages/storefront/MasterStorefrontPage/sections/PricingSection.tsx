import React, { useState, useEffect } from 'react';
import { moduleService } from '../../../../shared/api/services/moduleService';
import type { ModuleDto } from '../../../../shared/api/services/moduleService';

interface PricingProps {
  onRegisterClick: (planId?: string) => void;
}

const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return '₺0';
  return `₺${price.toLocaleString('tr-TR')}`;
};

export const PricingSection: React.FC<PricingProps> = ({ onRegisterClick }) => {
  const [yearly, setYearly] = useState(false);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await moduleService.getPublicModules();
        setModules(data);
      } catch {
        // Fallback or error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const parseFeatures = (json: string | null): string[] => {
    if (!json) return [];
    try {
      return JSON.parse(json) as string[];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <section id="pricing" className="landing-pricing">
        <div className="landing-section-header">
          <h2>Fiyatlandırma</h2>
          <p>Yükleniyor...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="landing-pricing">
      <div className="landing-section-header">
        <h2>Fiyatlandırma</h2>
        <p>
          İhtiyacınıza göre esnek modüller. Sadece ihtiyacınız olanı seçin, işinizi büyütün.
        </p>
      </div>

      <div className="landing-pricing-toggle" role="group" aria-label="Faturalama dönemi">
        <button
          className="landing-pricing-toggle-btn"
          aria-pressed={!yearly}
          onClick={() => setYearly(false)}
        >
          Aylık
        </button>
        <button
          className="landing-pricing-toggle-btn"
          aria-pressed={yearly}
          onClick={() => setYearly(true)}
        >
          Yıllık
          <span className="landing-pricing-discount-badge">Özel Fiyat</span>
        </button>
      </div>

      <div className="landing-pricing-grid">
        {modules.map((module) => {
          const price = yearly ? module.priceYearly : module.priceMonthly;
          const features = parseFeatures(module.featuresJson);

          return (
            <div
              key={module.id}
              className={`landing-pricing-card${module.isPopular ? ' popular' : ''}`}
              style={{ '--accent-color': module.colorAccent || 'var(--color-primary)' } as any}
            >
              {module.isPopular && (
                <span className="landing-pricing-popular-badge">POPÜLER</span>
              )}

              <p className="landing-pricing-plan-name">{module.name}</p>
              <p className="landing-pricing-plan-desc">{module.description || 'Modül açıklaması yakında eklenecek.'}</p>

              <div className="landing-pricing-price-wrap">
                <div className="landing-pricing-price" style={{ color: module.colorAccent || 'inherit' }}>
                  {price === 0 || price === null ? (
                    <>{formatPrice(0)}</>
                  ) : (
                    <>
                      <sup>₺</sup>
                      {yearly 
                        ? (Math.round((price ?? 0) / 12)).toLocaleString('tr-TR') 
                        : (price ?? 0).toLocaleString('tr-TR')}
                      <span>/ay</span>
                    </>
                  )}
                </div>
                {yearly && price !== null && price > 0 && (
                  <div className="landing-pricing-price-original">
                    Toplam: ₺{price.toLocaleString('tr-TR')}/yıl
                  </div>
                )}
              </div>

              <ul className="landing-pricing-features">
                {features.map((feat) => (
                  <li key={feat} className="included">
                    <span className="pricing-feat-icon-yes" aria-hidden="true" style={{ color: module.colorAccent || 'var(--color-primary)' }}>✓</span>
                    {feat}
                  </li>
                ))}
                {features.length === 0 && (
                  <li className="included">
                    <span className="pricing-feat-icon-yes" aria-hidden="true">✓</span>
                    Temel özellikler dahil
                  </li>
                )}
              </ul>

              <button
                className={`landing-pricing-btn ${module.isPopular ? 'primary' : 'ghost'}`}
                onClick={() => onRegisterClick(module.code)}
                style={module.isPopular ? { background: module.colorAccent ?? undefined } : { color: module.colorAccent ?? undefined, borderColor: module.colorAccent ?? undefined }}
              >
                Hemen Başla
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
