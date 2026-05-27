import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useFaqQuery } from '../../../entities/landing';
import s from './SssPage.module.css';

export function SssPage() {
  useScrollReveal();
  const { i18n } = useTranslation('landing');
  const { data, isLoading } = useFaqQuery(i18n.language);

  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const [activecat, setActivecat] = useState(() => data?.[0]?.slug ?? 'genel');

  const q = query.trim().toLowerCase();
  const filtered = (data ?? [])
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !q ||
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Sık Sorulan Sorular</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Aklınızda <span className="lp-grad-text">soru kalmasın</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Yanıt bulamadığınız bir şey varsa canlı destek ekibimiz 7/24 hazır.</p>
          <div className={`${s.searchWrap} fade-up`} data-delay="3">
            <span className={s.searchIc}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className={s.searchInput}
              type="search"
              placeholder="Sorunuzu arayın..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={s.searchKbd}>⌘ K</span>
          </div>
        </div>
      </section>

      <section className={s.page}>
        <div className="lp-container">
          <div className={s.pageShell}>
            <aside className={s.sidebar}>
              <div className={s.sideLabel}>Kategoriler</div>
              {isLoading ? (
                <div style={{ color: 'var(--text-muted)', padding: '8px 0', fontSize: '0.85rem' }}>Yükleniyor...</div>
              ) : (
                (data ?? []).map((cat) => (
                  <button
                    key={cat.slug}
                    className={`${s.sideLink} ${activecat === cat.slug && !q ? s.sideLinkOn : ''}`}
                    onClick={() => {
                      setActivecat(cat.slug);
                      document.getElementById(cat.slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span>{cat.label}</span>
                    <span className={s.sideNum}>{cat.items.length}</span>
                  </button>
                ))
              )}
            </aside>

            <div className={s.content}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Yükleniyor...</div>
              ) : filtered.length === 0 ? (
                <div className={s.emptyState}>
                  <div className={s.emptyIc}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <h4>Sonuç bulunamadı</h4>
                  <p>Aramanızla eşleşen bir soru yok. <a href="/iletisim" style={{ color: '#a5b4fc' }}>Bize sorun</a>.</p>
                </div>
              ) : (
                filtered.map((cat) => (
                  <div key={cat.slug} className={s.cat} id={cat.slug}>
                    <h2 className={s.catH2}>
                      <span className={s.catIc}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </span>
                      {cat.label}
                    </h2>
                    <div className={s.faqList}>
                      {cat.items.map((item, i) => {
                        const key = `${cat.slug}-${i}`;
                        const isOpen = openIdx === key;
                        return (
                          <div key={key} className={`${s.faqItem} lp-glass ${isOpen ? s.faqItemOpen : ''}`}>
                            <button className={s.faqQ} onClick={() => setOpenIdx(isOpen ? null : key)}>
                              {item.question}
                              <span className={s.faqIc}>+</span>
                            </button>
                            {isOpen && (
                              <div className={s.faqA}>
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={s.contact}>
        <div className="lp-container">
          <div className="lp-section-head fade-up">
            <span className="lp-eyebrow"><span className="lp-dot" />Hâlâ Yardım mı Lazım?</span>
            <h2 className="lp-section-head" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 'clamp(30px,3.6vw,42px)', fontWeight: 800, margin: '14px 0 0', letterSpacing: '-.025em' }}>
              Size <span className="lp-grad-text">yakınız</span>
            </h2>
          </div>
          <div className={s.contactGrid} style={{ marginTop: 32 }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, title: 'Canlı Destek', desc: 'Anında yanıt için sağ alttaki chat balonuna tıklayın. Türkçe destek ekibi 7/24 hazır.', meta: '● Aktif şu an — ort. 30sn yanıt', btn: 'Chat\'i Aç', href: '#', delay: '0' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6 12 13 2 6" /></svg>, title: 'E-posta', desc: 'Daha detaylı sorular için. Genelde 2 saatin altında yanıt alırsınız.', meta: 'destek@wixi.app', btn: 'E-posta Gönder', href: 'mailto:destek@wixi.app', delay: '1' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-2.02a2 2 0 0 1 2.11-.45c1 .35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z" /></svg>, title: 'Telefon', desc: 'Hafta içi 09:00 — 18:00 arası. Premium üyelerimiz için 7/24 acil hat.', meta: '+90 (212) 999 00 00', btn: 'Şimdi Ara', href: 'tel:+902129990000', delay: '2' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, title: 'Demo Randevusu', desc: '15 dakikalık 1:1 görüşme. Uzmanımız ihtiyacınıza özel demo yapsın.', meta: 'Müsait slotlar — bugün/yarın', btn: 'Takvimi Aç', href: '#', delay: '3' },
            ].map((card) => (
              <article key={card.title} className={`${s.contactCard} lp-glass fade-up`} data-delay={card.delay}>
                <div className={s.ccIc}>{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className={s.ccMeta}><strong>{card.meta}</strong></div>
                <div className={s.btnRow}>
                  <a href={card.href} className="lp-btn lp-btn--ghost lp-btn--sm">{card.btn}</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hâlâ kararsız mısınız? <span className="lp-grad-text">Deneyin görün.</span></h2>
            <p>14 gün ücretsiz, kredi kartı gerekmez, istediğiniz an iptal.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Deneyin →</a>
              <Link to="/fiyatlandirma" className="lp-btn lp-btn--ghost lp-btn--lg">Planları Gör</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
