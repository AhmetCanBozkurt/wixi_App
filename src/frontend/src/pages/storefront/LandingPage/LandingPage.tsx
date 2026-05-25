import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal, useCountUp } from './hooks';
import s from './LandingPage.module.css';

/* ── Arrow SVG ── */
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

/* ── Check SVG for CTA ── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ── NavCard component (tilt effect, ref safe outside map) ── */
interface NavCardProps {
  num: string;
  href: string;
  title: string;
  desc: string;
  cta: string;
  delay: string;
  viz: ReactNode;
}

function NavCard({ num, href, title, desc, cta, delay, viz }: NavCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rect: DOMRect | null = null;
    const max = 8;

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    };
    const reset = () => {
      el.style.transform = '';
      rect = null;
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove as EventListener);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove as EventListener);
      el.removeEventListener('mouseleave', reset);
    };
  }, []);

  return (
    <Link
      ref={ref}
      to={href}
      className={`lp-glass lp-sweep ${s.navCard} fade-up`}
      data-delay={delay}
    >
      <div className={s.navCardNum}>{num}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className={s.navCardArrow}>
        {cta} <ArrowRight />
      </span>
      {viz}
    </Link>
  );
}

/* ── Nav card data ── */
const navCardData: NavCardProps[] = [
  {
    num: '01 — Özellikler',
    href: '/ozellikler',
    title: 'Modüller, derinlemesine',
    desc: 'E-Ticaret, CRM, İK ve Tema Editörü — her modülün ekranlarını, akışlarını ve özelliklerini inceleyin.',
    cta: 'İncele',
    delay: '0',
    viz: (
      <svg className={s.navCardViz} viewBox="0 0 200 200" fill="none">
        <rect x="20" y="20" width="70" height="70" rx="14" fill="rgba(99,102,241,.2)" stroke="rgba(99,102,241,.5)" />
        <rect x="110" y="20" width="70" height="70" rx="14" fill="rgba(139,92,246,.2)" stroke="rgba(139,92,246,.5)" />
        <rect x="20" y="110" width="70" height="70" rx="14" fill="rgba(139,92,246,.2)" stroke="rgba(139,92,246,.5)" />
        <rect x="110" y="110" width="70" height="70" rx="14" fill="rgba(99,102,241,.2)" stroke="rgba(99,102,241,.5)" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    num: '02 — Nasıl Çalışır?',
    href: '/nasil-calisir',
    title: '3 adımda yayında',
    desc: 'Kayıt olun, modülünüzü seçin, mağazanızı açın. Etkileşimli adım demosunu deneyin.',
    cta: 'Demoyu izle',
    delay: '1',
    viz: (
      <svg className={s.navCardViz} viewBox="0 0 200 200" fill="none">
        <circle cx="50" cy="100" r="22" fill="rgba(99,102,241,.18)" stroke="rgba(99,102,241,.55)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="22" fill="rgba(139,92,246,.18)" stroke="rgba(139,92,246,.55)" strokeWidth="1.5" />
        <circle cx="150" cy="100" r="22" fill="rgba(196,181,253,.18)" stroke="rgba(196,181,253,.55)" strokeWidth="1.5" />
        <path d="M72 100h6M122 100h6" stroke="rgba(196,181,253,.6)" strokeWidth="2" strokeDasharray="3 3" />
        <text x="50" y="106" textAnchor="middle" fill="#a5b4fc" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans">1</text>
        <text x="100" y="106" textAnchor="middle" fill="#c4b5fd" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans">2</text>
        <text x="150" y="106" textAnchor="middle" fill="#ddd6fe" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans">3</text>
      </svg>
    ),
  },
  {
    num: '03 — Fiyatlandırma',
    href: '/fiyatlandirma',
    title: 'Her ölçeğe uygun plan',
    desc: 'Standart, Premium ve Kurumsal. Aylık/yıllık seçenekleri ve detaylı plan karşılaştırması.',
    cta: 'Planları gör',
    delay: '2',
    viz: (
      <svg className={s.navCardViz} viewBox="0 0 200 200" fill="none">
        <rect x="20" y="60" width="50" height="120" rx="10" fill="rgba(99,102,241,.18)" stroke="rgba(99,102,241,.45)" />
        <rect x="80" y="30" width="50" height="150" rx="10" fill="rgba(139,92,246,.28)" stroke="rgba(139,92,246,.6)" />
        <rect x="140" y="70" width="50" height="110" rx="10" fill="rgba(99,102,241,.18)" stroke="rgba(99,102,241,.45)" />
        <circle cx="105" cy="22" r="6" fill="#8b5cf6" />
      </svg>
    ),
  },
  {
    num: '04 — Sık Sorulanlar',
    href: '/sss',
    title: 'Aklınızda soru kalmasın',
    desc: 'Güvenlik, faturalandırma, veri taşıma ve daha fazlası. 7/24 canlı destek seçeneği.',
    cta: 'Cevapları gör',
    delay: '3',
    viz: (
      <svg className={s.navCardViz} viewBox="0 0 200 200" fill="none">
        <rect x="20" y="40" width="160" height="36" rx="10" fill="rgba(139,92,246,.2)" stroke="rgba(139,92,246,.5)" />
        <rect x="20" y="90" width="160" height="36" rx="10" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)" />
        <rect x="20" y="140" width="160" height="36" rx="10" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)" />
        <circle cx="168" cy="58" r="8" fill="#8b5cf6" />
        <text x="168" y="62" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">−</text>
      </svg>
    ),
  },
];

/* ── Sidebar nav items ── */
const sidebarItems = [
  {
    label: 'Genel Bakış',
    active: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'E-Ticaret',
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      </svg>
    ),
  },
  {
    label: 'CRM',
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="9" cy="7" r="4" />
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      </svg>
    ),
  },
  {
    label: 'İK',
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Raporlar',
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    label: 'Ayarlar',
    active: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

/* ── Stat cards in dashboard mockup ── */
const dashStats = [
  { label: 'Gelir', value: '₺248K', delta: '▲ 18.2%' },
  { label: 'Sipariş', value: '1,284', delta: '▲ 12.4%' },
  { label: 'Müşteri', value: '892', delta: '▲ 7.1%' },
];

/* ── Stats band data ── */
const statsData = [
  { count: '1250', suffix: '+', label: 'Aktif Mağaza', path: 'M2,18 L14,15 L26,17 L38,12 L50,14 L62,8 L74,10 L82,4' },
  { count: '4.5', decimals: '1', prefix: '₺', suffix: 'M+', label: 'Aylık İşlem', path: 'M2,20 L14,18 L26,14 L38,15 L50,10 L62,11 L74,6 L82,3' },
  { count: '99.9', decimals: '1', suffix: '%', label: 'Uptime', path: 'M2,6 L14,5 L26,7 L38,4 L50,5 L62,3 L74,4 L82,2' },
  { count: '24', suffix: '/7', label: 'Canlı Destek', path: 'M2,12 L14,10 L26,14 L38,8 L50,12 L62,6 L74,9 L82,5' },
];

/* ── Marquee brand names ── */
const marqueeNames = [
  'NoraTekstil', 'KuzeyKahve', 'Mimoza Studio', 'Anadolu Bakery',
  'Sefa Optik', 'Veranda', 'Levanten Cafe', 'Atlas Spor',
  'NoraTekstil', 'KuzeyKahve', 'Mimoza Studio', 'Anadolu Bakery',
  'Sefa Optik', 'Veranda', 'Levanten Cafe', 'Atlas Spor',
];

/* ══════════════════════════════════════════════════════════════
   LandingPage
══════════════════════════════════════════════════════════════ */
export function LandingPage() {
  useScrollReveal();
  useCountUp();

  /* Hero spotlight */
  const heroRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const spot = spotRef.current;
    if (!hero || !spot) return;

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', e.clientX - r.left + 'px');
      spot.style.setProperty('--my', e.clientY - r.top + 'px');
      spot.classList.add('on');
    };
    const onLeave = () => spot.classList.remove('on');

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    return () => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <LandingLayout>
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className={s.hero} ref={heroRef}>
        <div ref={spotRef} className="lp-spotlight" />
        <div className={`lp-container ${s.heroGrid}`}>
          {/* Copy column */}
          <div className={s.heroCopy}>
            <div className={s.heroPills}>
              <span className="lp-eyebrow fade-up">
                <span className="lp-dot" />14 gün ücretsiz deneme
              </span>
              <span className="lp-eyebrow fade-up" data-delay="1">
                <span className="lp-dot" />Kredi kartı gerekmez
              </span>
              <span className="lp-eyebrow fade-up" data-delay="2">
                <span className="lp-dot" />Kurulum 2 dakika
              </span>
            </div>

            <h1 className={`${s.heroH1} word-stagger`}>
              <span className="w">İşinizi</span>
              <br />
              <span className={`w ${s.heroGrad}`}>Zirveye</span>
              <br />
              <span className="w">Taşıyın.</span>
            </h1>

            <p className={`${s.heroSub} fade-up`} data-delay="2">
              Modüler yapısı ile E-Ticaret, CRM, Notlar ve Görev Takibini tek çatı altında yönetin.
              Türk KOBİ'leri için tasarlandı.
            </p>

            <div className={`${s.heroCta} fade-up`} data-delay="3">
              <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
                Ücretsiz Deneyin →
              </Link>
              <button className="lp-btn lp-btn--ghost lp-btn--lg">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5v11l9-5.5z" />
                </svg>
                Demo İzle
              </button>
            </div>

            <div className={`${s.heroTrust} fade-up`} data-delay="4">
              <div className={s.avatars}>
                <span>AY</span>
                <span>MK</span>
                <span>ED</span>
                <span>ZK</span>
              </div>
              <div className={s.trustInfo}>
                <strong>
                  <span data-count="1250" data-suffix="+">0</span> aktif işletme
                </strong>
                <span className={s.stars}>★★★★★</span> 4.9 / 5 ortalama puan
              </div>
            </div>
          </div>

          {/* Visual column */}
          <div className={`${s.heroVisual} scale-in`}>
            {/* Dashboard mockup */}
            <div className={s.dash}>
              <div className={s.dashTop}>
                <div className={s.dashDots}>
                  <span className={s.dotRed} />
                  <span className={s.dotAmber} />
                  <span className={s.dotGreen} />
                </div>
                <div className={s.dashPath}>wixi.app / dashboard</div>
                <div style={{ width: 32 }} />
              </div>
              <div className={s.dashBody}>
                <aside className={s.dashSide}>
                  {sidebarItems.map(({ label, active, icon }) => (
                    <div key={label} className={`${s.dashNav} ${active ? s.dashNavActive : ''}`}>
                      <span className={s.dashNavIc}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </aside>
                <div className={s.dashMain}>
                  <div className={s.dashStats}>
                    {dashStats.map((stat) => (
                      <div key={stat.label} className={s.stat}>
                        <div className={s.statLabel}>{stat.label}</div>
                        <div className={s.statValue}>{stat.value}</div>
                        <div className={s.statDelta}>{stat.delta}</div>
                      </div>
                    ))}
                  </div>
                  <div className={s.dashChart}>
                    <svg viewBox="0 0 300 130" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="dashLg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".5" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,95 C30,85 50,75 75,70 C105,62 125,78 155,58 C185,42 205,55 235,40 C260,30 285,22 300,20 L300,130 L0,130 Z"
                        fill="url(#dashLg)"
                      />
                      <path
                        className={s.linePath}
                        d="M0,95 C30,85 50,75 75,70 C105,62 125,78 155,58 C185,42 205,55 235,40 C260,30 285,22 300,20"
                        stroke="#a78bfa"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        className={s.pulseDot}
                        cx="235"
                        cy="40"
                        r="3.5"
                        fill="#fff"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating module cards */}
            <div className={`${s.float} ${s.float1}`}>
              <span className={s.floatCheck}>✓</span>E-Ticaret
            </div>
            <div className={`${s.float} ${s.float2}`}>
              <span className={s.floatCheck}>✓</span>CRM
            </div>
            <div className={`${s.float} ${s.float3}`}>
              <div className={s.floatBig}>
                <span data-count="1250" data-suffix="+ Mağaza">0</span>
              </div>
              <div className={s.floatSub}>₺4.5M+ İşlem</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ LOGOS MARQUEE ══════════════════════════ */}
      <section className={s.logos}>
        <div className="lp-container">
          <div className={s.logosLabel}>1,250+ Türk işletmesi tarafından tercih ediliyor</div>
        </div>
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>
            {marqueeNames.map((name, i) => (
              <span key={i} className={s.logoItem}>
                <span className={s.logoPin} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ NAV CARDS ══════════════════════════ */}
      <section className={`lp-section ${s.navCards}`}>
        <div className="lp-container">
          <div className="lp-section-head fade-up">
            <span className="lp-eyebrow">
              <span className="lp-dot" />Keşfet
            </span>
            <h2 className="lp-section-title">
              Wixi'yi <span className="lp-grad-text">daha yakından</span> tanıyın
            </h2>
            <p>Her başlığın detaylı bir sayfası var. Modüllerin nasıl çalıştığını, fiyatlandırmayı ve süreç akışını inceleyin.</p>
          </div>

          <div className={s.navCardsGrid}>
            {navCardData.map((card) => (
              <NavCard key={card.href} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ STATS BAND ══════════════════════════ */}
      <section className={`lp-section ${s.statsBand}`}>
        <div className="lp-container">
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="sparkG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className={s.statsGrid}>
            {statsData.map((stat, i) => (
              <div key={stat.label} className={`${s.statItem} fade-up`} data-delay={String(i)}>
                <div className={s.statNum}>
                  {stat.prefix}
                  <span
                    data-count={stat.count}
                    data-suffix={stat.suffix}
                    data-decimals={stat.decimals}
                  >
                    0
                  </span>
                </div>
                <div className={s.statLbl}>{stat.label}</div>
                <svg className={s.spark} viewBox="0 0 84 24">
                  <path
                    d={stat.path}
                    stroke="url(#sparkG)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA BANNER ══════════════════════════ */}
      <section className={`lp-section ${s.ctaBanner}`}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>
              Bugün başlayın, <span className="lp-grad-text">yarın yayında olun</span>
            </h2>
            <p>1,250+ Türk işletmesinin tercihi Wixi ile mağazanızı 5 dakikada açın.</p>
            <div className={s.ctaBtns}>
              <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
                Ücretsiz Deneyin →
              </Link>
              <button className="lp-btn lp-btn--ghost lp-btn--lg">Satış Ekibiyle Konuşun</button>
            </div>
            <div className={s.ctaSmall}>
              <span>
                <CheckIcon /> 14 gün ücretsiz
              </span>
              <span>
                <CheckIcon /> Kredi kartı gerekmez
              </span>
              <span>
                <CheckIcon /> İstediğiniz an iptal
              </span>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
