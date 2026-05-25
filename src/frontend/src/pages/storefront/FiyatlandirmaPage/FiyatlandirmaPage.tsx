import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './FiyatlandirmaPage.module.css';

const PLANS = [
  {
    name: 'Standart',
    monthly: 499,
    yearly: 399,
    desc: 'Dijitale yeni başlayan tek mağaza işletmeleri için.',
    features: ['E-Ticaret modülü', '5.000 ürün', 'Standart tema editörü', '3 kullanıcı', 'E-posta desteği', 'Temel analitik'],
    popular: false,
    cta: 'Ücretsiz Başla',
  },
  {
    name: 'Premium',
    monthly: 1299,
    yearly: 1039,
    desc: 'Büyüyen işletmeler ve çok kanallı satış yapanlar için.',
    features: ['Tüm Standart özellikler', 'Sınırsız ürün', '5 modül seçimi', '15 kullanıcı', 'Öncelikli destek (ort. 30sn)', 'Gelişmiş analitik', 'Pazaryeri entegrasyonu', 'API erişimi'],
    popular: true,
    cta: 'Ücretsiz Başla',
  },
  {
    name: 'Kurumsal',
    monthly: 0,
    yearly: 0,
    desc: '50+ kişilik ekipler ve özel gereksinimi olan şirketler.',
    features: ['Tüm Premium özellikler', 'Sınırsız modül', 'Sınırsız kullanıcı', 'Özel SLA', 'Dedicated account manager', 'Özel entegrasyonlar', 'Eğitim & onboarding'],
    popular: false,
    cta: 'Teklif Al',
  },
];

const TABLE_ROWS = [
  { label: 'Ürün limiti', standart: '5.000', premium: 'Sınırsız', kurumsal: 'Sınırsız' },
  { label: 'Kullanıcı', standart: '3', premium: '15', kurumsal: 'Sınırsız' },
  { label: 'Modül sayısı', standart: '1 (E-Ticaret)', premium: '5 seçim', kurumsal: 'Sınırsız' },
  { label: 'Destek', standart: 'E-posta', premium: 'Canlı 30sn', kurumsal: 'Dedicated' },
  { label: 'API erişimi', standart: '✕', premium: '✓', kurumsal: '✓' },
  { label: 'Özel domain', standart: '✓', premium: '✓', kurumsal: '✓' },
];

const FAQS = [
  { q: 'Ücretsiz deneme var mı?', a: 'Evet, her plan için 14 gün ücretsiz deneme sunuyoruz. Kredi kartı gerekmez.' },
  { q: 'Modülleri sonradan değiştirebilir miyim?', a: 'Evet, istediğiniz zaman modül ekleyebilir veya çıkarabilirsiniz. Değişiklik bir sonraki faturada yansır.' },
  { q: 'Yıllık ödeme farkı nedir?', a: 'Yıllık ödemede %20 indirim uygulanır. Faturalama yıllık tek seferdir.' },
  { q: 'İptal politikanız nedir?', a: 'İstediğiniz zaman iptal edebilirsiniz. Mevcut dönem ücretini iade etmiyoruz.' },
];

export function FiyatlandirmaPage() {
  useScrollReveal();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Fiyatlandırma</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Sadece kullandığınız <span className="lp-grad-text">kadar ödeyin</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">İşletmeniz büyüdükçe Wixi de büyür. Modülleri istediğiniz zaman açın, kapatın.</p>

          <div className={`${s.toggle} fade-up`} data-delay="3">
            <span className={!yearly ? s.toggleActive : ''}>Aylık</span>
            <button className={s.toggleBtn} onClick={() => setYearly(!yearly)} aria-label="Fiyat döngüsü">
              <span className={`${s.togglePill} ${yearly ? s.togglePillRight : ''}`} />
            </button>
            <span className={yearly ? s.toggleActive : ''}>Yıllık <span className={s.saveBadge}>%20 indirim</span></span>
          </div>
        </div>
      </section>

      <section className={s.plans}>
        <div className="lp-container">
          <div className={s.planGrid}>
            {PLANS.map((p, i) => (
              <article
                key={p.name}
                className={`${s.planCard} lp-glass fade-up ${p.popular ? s.planPopular : ''}`}
                data-delay={String(i)}
              >
                {p.popular && <div className={s.popularBadge}>En Popüler</div>}
                <div className={s.planTop}>
                  <h2 className={s.planName}>{p.name}</h2>
                  <p className={s.planDesc}>{p.desc}</p>
                  <div className={s.planPrice}>
                    {p.monthly === 0 ? (
                      <span className={s.customPrice}>Özel Fiyat</span>
                    ) : (
                      <>
                        <span className={s.currency}>₺</span>
                        <span className={s.amount}>{yearly ? p.yearly : p.monthly}</span>
                        <span className={s.period}>/ay</span>
                      </>
                    )}
                  </div>
                  {yearly && p.monthly > 0 && (
                    <div className={s.yearNote}>Yıllık ₺{(p.yearly * 12).toLocaleString('tr')} faturalanır</div>
                  )}
                </div>
                <a href="/login" className={`lp-btn ${p.popular ? 'lp-btn--primary' : 'lp-btn--ghost'} ${s.planCta}`}>{p.cta}</a>
                <ul className={s.planFeatures}>
                  {p.features.map((f) => (
                    <li key={f}><span className={s.fCheck}>✓</span>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section className={s.compare}>
        <div className="lp-container">
          <div className={`${s.compareHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Detaylı Karşılaştırma</span>
            <h2 className={s.compareH2}>Plan <span className="lp-grad-text">karşılaştırması</span></h2>
          </div>
          <div className={`${s.tableWrap} lp-glass fade-up`}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th></th>
                  {PLANS.map((p) => <th key={p.name}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className={s.rowLabel}>{row.label}</td>
                    <td>{row.standart}</td>
                    <td className={s.tdHighlight}>{row.premium}</td>
                    <td>{row.kurumsal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MINI FAQ */}
      <section className={s.faqSection}>
        <div className="lp-container">
          <div className={`${s.faqHead} fade-up`}>
            <h2 className={s.faqH2}>Sık sorulan <span className="lp-grad-text">sorular</span></h2>
          </div>
          <div className={s.faqGrid}>
            {FAQS.map((f, i) => (
              <div key={f.q} className={`${s.faqItem} lp-glass fade-up`} data-delay={String(i % 2)}>
                <button className={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`${s.faqArrow} ${openFaq === i ? s.faqArrowOpen : ''}`}>▾</span>
                </button>
                {openFaq === i && <p className={s.faqA}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hâlâ kararsız mısınız? <span className="lp-grad-text">Demo alın.</span></h2>
            <p>Uzmanımız 15 dakikada platformu size özel gösterir. Ücretsiz.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">14 Gün Ücretsiz →</a>
              <Link to="/iletisim" className="lp-btn lp-btn--ghost lp-btn--lg">Demo Randevusu Al</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
