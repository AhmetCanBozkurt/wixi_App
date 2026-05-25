import { useState } from 'react';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './OzelliklerPage.module.css';

const TABS = [
  { id: 'eticaret', label: 'E-Ticaret', icon: '🛒', color: '#8b5cf6' },
  { id: 'crm', label: 'CRM', icon: '👥', color: '#06b6d4' },
  { id: 'hr', label: 'İnsan Kaynakları', icon: '🏢', color: '#10b981' },
  { id: 'studyo', label: 'Stüdyo', icon: '⚡', color: '#f59e0b' },
  { id: 'tema', label: 'Tema Editörü', icon: '🎨', color: '#ec4899' },
];

const TAB_CONTENT: Record<string, { title: string; desc: string; features: string[] }> = {
  eticaret: {
    title: 'E-Ticaret Platformu',
    desc: 'Online mağazanızı dakikalar içinde açın. Ürün, stok, sipariş — tek panelde.',
    features: ['Sınırsız ürün ve kategori', 'Çoklu varyant yönetimi', 'Otomatik stok takibi', 'Trendyol & Hepsiburada entegrasyonu', 'İyzipay, Stripe, kapıda ödeme', 'SEO-dostu URL yapısı'],
  },
  crm: {
    title: 'CRM Modülü',
    desc: '360° müşteri profili, fırsat takibi ve kampanya yönetimi tek ekranda.',
    features: ['Kanban pipeline görünümü', 'Otomatik görev atama', 'E-posta & SMS kampanyaları', 'Segmentasyon ve filtreleme', 'Aktivite zaman çizelgesi', 'Raporlar ve analitik'],
  },
  hr: {
    title: 'İnsan Kaynakları',
    desc: 'Personel, izin, bordro ve performans yönetimi — tam entegre.',
    features: ['Dijital özlük dosyası', 'İzin & vardiya planlama', 'Otomatik bordro hesaplama', 'SGK e-bildirge', '360° performans değerlendirme', 'İşe alım (ATS) modülü'],
  },
  studyo: {
    title: 'Stüdyo — Form Builder',
    desc: 'AI destekli no-code form ve iş akışı tasarımcısı.',
    features: ['Sürükle-bırak arayüzü', 'AI form üretici (Beta)', '30+ hazır bileşen', 'Koşullu mantık & akışlar', 'Webhook & API entegrasyonu', 'Gerçek zamanlı önizleme'],
  },
  tema: {
    title: 'Tema Editörü',
    desc: 'Kod yazmadan mağazanızın görünümünü tamamen özelleştirin.',
    features: ['Canlı önizleme ile düzenleme', 'Renk, font ve layout kontrolü', '50+ hazır tema şablonu', 'Özel CSS/JS ekleme', 'Mobil-öncelikli tasarım', 'Tek tıkla yayınlama'],
  },
};

const EXTRAS = [
  { title: 'Çok Dilli', desc: '12 dil, otomatik çeviri desteği' },
  { title: 'Güçlü API', desc: 'REST & Webhook, tam entegrasyon' },
  { title: '%99.9 Uptime', desc: 'SLA garantili altyapı' },
  { title: 'Anlık Destek', desc: 'Ort. 30 saniye yanıt süresi' },
  { title: 'Veri Güvenliği', desc: 'ISO 27001, Türkiye\'de barındırma' },
  { title: 'Mobil Uygulama', desc: 'iOS & Android yönetici uygulaması' },
];

export function OzelliklerPage() {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState('eticaret');
  const content = TAB_CONTENT[activeTab];

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Özellikler</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">
            Her şey <span className="lp-grad-text">tek platformda</span>
          </h1>
          <p className={`${s.lead} fade-up`} data-delay="2">
            Wixi'nin 35+ modülünden en çok kullanılan 5 çekirdeği. Entegre, hızlı ve gerçekten kullanılabilir.
          </p>
        </div>
      </section>

      <section className={s.tabs}>
        <div className="lp-container">
          <div className={`${s.tabNav} fade-up`}>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`${s.tabBtn} ${activeTab === t.id ? s.tabBtnOn : ''}`}
                onClick={() => setActiveTab(t.id)}
                style={{ '--tab-color': t.color } as React.CSSProperties}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          <div className={`${s.tabContent} fade-up`}>
            <div className={s.tabCopy}>
              <h2 className={s.tabH2}>{content.title}</h2>
              <p className={s.tabDesc}>{content.desc}</p>
              <ul className={s.featureList}>
                {content.features.map((f) => (
                  <li key={f}><span className={s.check}>✓</span>{f}</li>
                ))}
              </ul>
              <a href="/login" className="lp-btn lp-btn--primary" style={{ marginTop: '24px' }}>Ücretsiz Dene →</a>
            </div>
            <div className={s.tabViz}>
              <div className={s.mockup}>
                <div className={s.mockupBar}>
                  <div className={s.mockupDots}><span /><span /><span /></div>
                  <span className={s.mockupPath}>{activeTab}.wixi.app</span>
                </div>
                <div className={s.mockupBody}>
                  <div className={s.mockupContent}>
                    {content.features.map((f, i) => (
                      <div key={f} className={s.mockupRow} style={{ animationDelay: `${i * 0.05}s` }}>
                        <span className={s.mockupDot} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.extras}>
        <div className="lp-container">
          <div className={`${s.extrasHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Platform Altyapısı</span>
            <h2 className={s.extrasH2}>Modüllerin <span className="lp-grad-text">altındaki güç</span></h2>
            <p>Her Wixi planında gelen temel altyapı özellikleri.</p>
          </div>
          <div className={s.extrasGrid}>
            {EXTRAS.map((e, i) => (
              <div key={e.title} className={`${s.extraCard} lp-glass fade-up`} data-delay={String(i % 3)}>
                <strong>{e.title}</strong>
                <span>{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hepsini <span className="lp-grad-text">bugün deneyin</span></h2>
            <p>14 gün ücretsiz, kredi kartı gerekmez. İstediğiniz zaman iptal edin.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Başla →</a>
              <a href="/fiyatlandirma" className="lp-btn lp-btn--ghost lp-btn--lg">Planları Gör</a>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
