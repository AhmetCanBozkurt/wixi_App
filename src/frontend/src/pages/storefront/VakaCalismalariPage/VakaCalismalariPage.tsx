import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useCasesQuery } from '../../../entities/landing';
import s from './VakaCalismalariPage.module.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tümü' },
  { id: 'retail', label: 'Perakende' },
  { id: 'food', label: 'Gıda & Restoran' },
  { id: 'textile', label: 'Tekstil' },
  { id: 'service', label: 'Hizmet' },
  { id: 'manufacture', label: 'Üretim' },
];

const GRADIENT_CLASSES = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;

const ARROW_ICON = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;

export function VakaCalismalariPage() {
  useScrollReveal();
  const { i18n } = useTranslation();
  const [active, setActive] = useState('all');
  const { data, isLoading } = useCasesQuery(i18n.language);

  const visibleCards = data
    ? data.all.filter((c) => active === 'all' || c.industry === active)
    : [];

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Vaka Çalışmaları</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Müşterilerimizin <span className="lp-grad-text">başarı hikayeleri</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Türkiye'nin dört bir yanından KOBİ'ler Wixi ile nasıl büyüdü, neyi kolaylaştırdı, kaç saat kazandı.</p>
          <div className={`${s.stats} fade-up`} data-delay="3">
            <div className={s.statsItem}><div className={s.statsNum}>1.250+</div><div className={s.statsLbl}>İşletme</div></div>
            <div className={s.statsItem}><div className={s.statsNum}>%287</div><div className={s.statsLbl}>Ort. büyüme</div></div>
            <div className={s.statsItem}><div className={s.statsNum}>4.9★</div><div className={s.statsLbl}>Memnuniyet</div></div>
          </div>
        </div>
      </section>

      <section className={s.filters}>
        <div className="lp-container">
          <div className={s.filtersRow}>
            {FILTER_OPTIONS.map((f) => (
              <button key={f.id} className={`${s.filterBtn} ${active === f.id ? s.filterBtnOn : ''}`} onClick={() => setActive(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>
      </section>

      {data?.featured && (
        <section className={s.featured}>
          <div className="lp-container">
            <article className={`${s.featuredCard} fade-up`}>
              <div className={s.featuredVisual}>
                <div className={s.featuredBrand}>{data.featured.clientInitials}</div>
                <div className={s.featuredQuote}>
                  {data.featured.quoteText && (
                    <p>{data.featured.quoteText}</p>
                  )}
                  {data.featured.quoteAuthor && (
                    <div className="who"><b>{data.featured.quoteAuthor}</b> · {data.featured.clientName}</div>
                  )}
                </div>
              </div>
              <div className={s.featuredBody}>
                <span className={s.featuredTag}>⭐ Öne Çıkan</span>
                <h2>{data.featured.title}</h2>
                <p>{data.featured.description}</p>
                <div className={s.featuredResults}>
                  <div className={s.csResult}><b>{data.featured.metric1Value}</b><span>{data.featured.metric1Label}</span></div>
                  <div className={s.csResult}><b>{data.featured.metric2Value}</b><span>{data.featured.metric2Label}</span></div>
                </div>
                <a href="#" className="lp-btn lp-btn--primary">Detaylı Hikayeyi Okuyun →</a>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className={s.grid}>
        <div className="lp-container">
          {isLoading && <div>Yükleniyor...</div>}
          <div className={s.gridRow}>
            {visibleCards.map((card, i) => {
              const gradClass = GRADIENT_CLASSES[i % GRADIENT_CLASSES.length];
              return (
                <article key={card.id} className={`${s.csCard} ${s[gradClass as keyof typeof s]} lp-glass fade-up`} data-delay={String(i % 3)}>
                  <div className={s.csCardTop}>
                    <div className={s.csCardBrand}>{card.clientInitials}</div>
                    <div className={s.csCardTag}>{card.industry}</div>
                  </div>
                  <div className={s.csCardBody}>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className={s.csCardMetrics}>
                      <div className={s.csCardMetric}><b>{card.metric1Value}</b><span>{card.metric1Label}</span></div>
                      <div className={s.csCardMetric}><b>{card.metric2Value}</b><span>{card.metric2Label}</span></div>
                    </div>
                    <a href="#" className={s.csCardLink}>Okuyun {ARROW_ICON}</a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={s.band}>
        <div className="lp-container">
          <div className={s.bandGrid}>
            {[
              { num: '1.250+', lbl: 'Aktif işletme' },
              { num: '%287', lbl: 'Ortalama büyüme' },
              { num: '₺2.1M', lbl: 'Toplam ciro artışı' },
              { num: '4.9★', lbl: 'Müşteri memnuniyeti' },
            ].map((b) => (
              <div key={b.num}>
                <div className={s.bandNum}>{b.num}</div>
                <div className={s.bandLbl}>{b.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Siz de <span className="lp-grad-text">başarı hikayenizi</span> yazın.</h2>
            <p>14 gün ücretsiz deneyin. Wixi ile büyümeye bugün başlayın.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Başla →</a>
              <Link to="/iletisim" className="lp-btn lp-btn--ghost lp-btn--lg">Demo İsteyin</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
