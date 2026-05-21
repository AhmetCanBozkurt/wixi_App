import React from 'react';

interface FeatureModule {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  accent: string;
  glow: string;
  bullets: [string, string, string];
}

const MODULES: FeatureModule[] = [
  {
    id: 'ecommerce',
    name: 'E-Ticaret',
    icon: '🛍️',
    tagline: 'Satışlarınızı ölçeklendirin',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.12)',
    bullets: ['Sınırsız ürün listesi', 'Stok ve varyant takibi', 'Kargo entegrasyonu'],
  },
  {
    id: 'notes',
    name: 'Notlar & Dokümanlar',
    icon: '📝',
    tagline: 'Ekibinizle düşünün',
    accent: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.12)',
    bullets: ['Gerçek zamanlı işbirliği', 'Zengin metin editörü', 'Arama ve etiket sistemi'],
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: '🤝',
    tagline: 'Müşterinizi tanıyın',
    accent: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.12)',
    bullets: ['Müşteri profilleri', 'Satış hattı (kanban)', 'İletişim geçmişi'],
  },
  {
    id: 'tasks',
    name: 'Görev Takibi',
    icon: '✅',
    tagline: 'Projelerinizi yönetin',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.12)',
    bullets: ['Kanban ve liste görünümü', 'Görev atama ve son tarih', 'Sprint ve milestone'],
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="landing-features">
      <div className="landing-section-header">
        <h2>Neden WixiApp?</h2>
        <p>
          İşletmenizin ihtiyaç duyduğu her araç tek platformda. Modüler yapı sayesinde
          sadece kullandığınız için ödeme yaparsınız.
        </p>
      </div>

      <div className="landing-features-grid">
        {MODULES.map((mod) => (
          <article
            key={mod.id}
            className="landing-feature-card"
            style={
              {
                '--card-accent': mod.accent,
                '--card-glow': mod.glow,
              } as React.CSSProperties
            }
          >
            <div className="landing-feature-icon-wrap">
              {mod.icon}
            </div>
            <p className="landing-feature-tagline">{mod.tagline}</p>
            <h3>{mod.name}</h3>
            <ul className="landing-feature-bullets">
              {mod.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
