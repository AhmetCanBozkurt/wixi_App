import React, { useState } from 'react';

interface PricingProps {
  onRegisterClick: (planId?: string) => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  descMonthly: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  popular: boolean;
  btnLabel: string;
  btnClass: 'ghost' | 'primary' | 'purple';
  features: PlanFeature[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    descMonthly: '14 gün tam erişim',
    priceMonthly: 0,
    priceYearly: 0,
    popular: false,
    btnLabel: 'Ücretsiz Başla',
    btnClass: 'ghost',
    features: [
      { text: 'E-Ticaret modülü', included: true },
      { text: '100 ürün limiti', included: true },
      { text: 'Temel raporlar', included: true },
      { text: 'E-posta desteği', included: false },
      { text: 'CRM modülü', included: false },
      { text: 'Görev takibi', included: false },
      { text: 'Öncelikli destek', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    descMonthly: 'Büyüyen işletmeler için',
    priceMonthly: 299,
    priceYearly: 239,
    popular: true,
    btnLabel: 'Hemen Başla',
    btnClass: 'primary',
    features: [
      { text: 'E-Ticaret modülü', included: true },
      { text: 'Sınırsız ürün', included: true },
      { text: 'Gelişmiş raporlar', included: true },
      { text: 'E-posta desteği', included: true },
      { text: 'CRM modülü', included: true },
      { text: 'Görev takibi', included: false },
      { text: 'Öncelikli destek', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    descMonthly: 'Tüm özellikler dahil',
    priceMonthly: 799,
    priceYearly: 639,
    popular: false,
    btnLabel: "Pro'ya Geç",
    btnClass: 'purple',
    features: [
      { text: 'E-Ticaret modülü', included: true },
      { text: 'Sınırsız ürün', included: true },
      { text: 'Gelişmiş raporlar', included: true },
      { text: 'E-posta desteği', included: true },
      { text: 'CRM modülü', included: true },
      { text: 'Görev takibi', included: true },
      { text: 'Öncelikli destek', included: true },
    ],
  },
];

const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return '₺0';
  return `₺${price.toLocaleString('tr-TR')}`;
};

export const PricingSection: React.FC<PricingProps> = ({ onRegisterClick }) => {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="landing-pricing">
      <div className="landing-section-header">
        <h2>Fiyatlandırma</h2>
        <p>
          İhtiyacınıza göre esnek planlar. İstediğiniz zaman değiştirebilirsiniz.
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
          <span className="landing-pricing-discount-badge">%20 indirim</span>
        </button>
      </div>

      <div className="landing-pricing-grid">
        {PLANS.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const originalPrice = yearly ? plan.priceMonthly : null;

          return (
            <div
              key={plan.id}
              className={`landing-pricing-card${plan.popular ? ' popular' : ''}`}
            >
              {plan.popular && (
                <span className="landing-pricing-popular-badge">POPÜLER</span>
              )}

              <p className="landing-pricing-plan-name">{plan.name}</p>
              <p className="landing-pricing-plan-desc">{plan.descMonthly}</p>

              <div className="landing-pricing-price-wrap">
                <div className="landing-pricing-price">
                  {price === 0 ? (
                    <>{formatPrice(0)}</>
                  ) : (
                    <>
                      <sup>₺</sup>
                      {(price ?? 0).toLocaleString('tr-TR')}
                      <span>/ay</span>
                    </>
                  )}
                </div>
                {yearly && originalPrice !== null && originalPrice > 0 && (
                  <div className="landing-pricing-price-original">
                    ₺{originalPrice.toLocaleString('tr-TR')}/ay yerine
                  </div>
                )}
              </div>

              <ul className="landing-pricing-features">
                {plan.features.map((feat) => (
                  <li
                    key={feat.text}
                    className={feat.included ? 'included' : 'excluded'}
                  >
                    {feat.included ? (
                      <span className="pricing-feat-icon-yes" aria-hidden="true">✓</span>
                    ) : (
                      <span className="pricing-feat-icon-no" aria-hidden="true">✕</span>
                    )}
                    {feat.text}
                  </li>
                ))}
              </ul>

              <button
                className={`landing-pricing-btn ${plan.btnClass}`}
                onClick={() => onRegisterClick(plan.id)}
              >
                {plan.btnLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
