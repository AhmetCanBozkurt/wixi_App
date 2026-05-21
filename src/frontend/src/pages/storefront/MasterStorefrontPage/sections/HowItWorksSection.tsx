import React from 'react';

interface HowItWorksProps {
  onRegisterClick: () => void;
}

interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: '📋',
    title: 'Kaydol',
    description:
      'E-posta ve mağaza adınla 30 saniyede hesap oluştur. Kredi kartı gerekmez.',
  },
  {
    number: '02',
    icon: '💎',
    title: 'Plan Seç',
    description:
      'Bütçene ve ihtiyacına göre ücretsiz, Starter veya Pro planı seç.',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Mağazanı Yönet',
    description:
      'Ürünlerini ekle, siparişleri takip et, CRM ile müşterini büyüt.',
  },
];

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onRegisterClick }) => {
  return (
    <section id="how-it-works" className="landing-how">
      <div className="landing-section-header">
        <h2>Nasıl Çalışır?</h2>
        <p>3 adımda hazırsınız</p>
      </div>

      <div className="landing-how-steps">
        {STEPS.map((step) => (
          <div key={step.number} className="landing-how-step">
            <div className="landing-how-step-number" aria-hidden="true">
              {step.number}
            </div>
            <div className="landing-how-step-icon" aria-hidden="true">
              {step.icon}
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="landing-how-cta">
        <button className="landing-btn-primary" onClick={onRegisterClick}>
          Hemen Başla
        </button>
      </div>
    </section>
  );
};
