import { useState } from 'react';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal, useTilt } from '../../../widgets/LandingLayout/useLandingAnimations';
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

/* ── Per-module mockup components ── */
function EticaretMockup() {
  const products = [
    { name: 'Keten Gömlek', price: '₺349', badge: 'Yeni', color: '#8b5cf6' },
    { name: 'Slim Pantolon', price: '₺519', badge: 'İndirim', color: '#f59e0b' },
    { name: 'Deri Ceket', price: '₺1.299', badge: '', color: '' },
    { name: 'Spor Ayakkabı', price: '₺849', badge: 'Çok Satan', color: '#10b981' },
    { name: 'Kışlık Şapka', price: '₺179', badge: '', color: '' },
    { name: 'Renkli Eşarp', price: '₺229', badge: 'Yeni', color: '#8b5cf6' },
  ];
  const orders = [
    { id: '#4821', customer: 'Ayşe K.', status: 'Kargoda', statusColor: '#06b6d4' },
    { id: '#4820', customer: 'Mert D.', status: 'Hazırlanıyor', statusColor: '#f59e0b' },
    { id: '#4819', customer: 'Selin A.', status: 'Teslim', statusColor: '#10b981' },
  ];
  return (
    <div className={s.mockInner}>
      <div className={s.mockSection}>
        <span className={s.mockLabel}>Ürünler <span className={s.mockCount}>248</span></span>
        <div className={s.prodGrid}>
          {products.map((p) => (
            <div key={p.name} className={s.prodCard}>
              <div className={s.prodImg} />
              <div className={s.prodName}>{p.name}</div>
              <div className={s.prodRow}>
                <span className={s.prodPrice}>{p.price}</span>
                {p.badge && <span className={s.prodBadge} style={{ background: p.color + '22', color: p.color, borderColor: p.color + '44' }}>{p.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.mockSection}>
        <span className={s.mockLabel}>Son Siparişler</span>
        {orders.map((o) => (
          <div key={o.id} className={s.orderRow}>
            <span className={s.orderId}>{o.id}</span>
            <span className={s.orderCustomer}>{o.customer}</span>
            <span className={s.orderStatus} style={{ color: o.statusColor }}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrmMockup() {
  const cols = [
    {
      label: 'Prospect', color: '#6366f1', count: 8,
      cards: [
        { name: 'Alfa Holding', value: '₺45K', hot: false },
        { name: 'Beta Yazılım', value: '₺28K', hot: false },
      ],
    },
    {
      label: 'Teklif', color: '#f59e0b', count: 5,
      cards: [
        { name: 'Gamma Lojistik', value: '₺120K', hot: true },
      ],
    },
    {
      label: 'Hot', color: '#10b981', count: 3,
      cards: [
        { name: 'Delta Market', value: '₺89K', hot: true },
        { name: 'Epsilon Tech', value: '₺210K', hot: true },
      ],
    },
  ];
  return (
    <div className={s.mockInner}>
      <span className={s.mockLabel}>Pipeline — Q2 2025</span>
      <div className={s.kanban}>
        {cols.map((col) => (
          <div key={col.label} className={s.kanbanCol}>
            <div className={s.kanbanHead}>
              <span className={s.kanbanDot} style={{ background: col.color }} />
              <span className={s.kanbanLabel}>{col.label}</span>
              <span className={s.kanbanCount}>{col.count}</span>
            </div>
            {col.cards.map((card) => (
              <div key={card.name} className={`${s.kanbanCard} ${card.hot ? s.kanbanHot : ''}`}>
                <div className={s.kanbanName}>{card.name}</div>
                <div className={s.kanbanVal}>{card.value}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HrMockup() {
  const employees = [
    { name: 'Ali Yılmaz', role: 'Yazılım Geliştirici', status: 'Aktif', avatar: '#6366f1' },
    { name: 'Büşra Kaya', role: 'UX Tasarımcı', status: 'İzinde', avatar: '#8b5cf6' },
    { name: 'Can Demir', role: 'Proje Yöneticisi', status: 'Aktif', avatar: '#06b6d4' },
  ];
  // Donut ring chart percentages
  const segments = [
    { pct: 72, color: '#6366f1', label: 'Tam Gün' },
    { pct: 18, color: '#f59e0b', label: 'Yarım Gün' },
    { pct: 10, color: '#f87171', label: 'Devamsız' },
  ];
  const r = 32; const cx = 44; const cy = 44; const strokeW = 9;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className={s.mockInner}>
      <div className={s.hrTop}>
        <div className={s.hrTable}>
          <span className={s.mockLabel}>Personel</span>
          {employees.map((emp) => (
            <div key={emp.name} className={s.empRow}>
              <span className={s.empAvatar} style={{ background: emp.avatar }}>{emp.name[0]}</span>
              <div className={s.empInfo}>
                <span className={s.empName}>{emp.name}</span>
                <span className={s.empRole}>{emp.role}</span>
              </div>
              <span className={s.empStatus} style={{ color: emp.status === 'Aktif' ? '#10b981' : '#f59e0b' }}>
                {emp.status}
              </span>
            </div>
          ))}
        </div>
        <div className={s.hrDonut}>
          <span className={s.mockLabel}>Devam</span>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={strokeW} />
            {segments.map((seg) => {
              const dash = (seg.pct / 100) * circ;
              const el = (
                <circle
                  key={seg.label}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeW}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: 'stroke-dasharray .6s ease' }}
                />
              );
              offset += dash;
              return el;
            })}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#f5f6fb" fontSize="13" fontWeight="700">
              {segments[0].pct}%
            </text>
          </svg>
          <div className={s.donutLegend}>
            {segments.map((seg) => (
              <div key={seg.label} className={s.donutRow}>
                <span className={s.donutDot} style={{ background: seg.color }} />
                <span className={s.donutLabel}>{seg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudyoMockup() {
  const fields = [
    { type: 'text', label: 'Ad Soyad', placeholder: 'Müşteri adı' },
    { type: 'email', label: 'E-posta', placeholder: 'ornek@mail.com' },
    { type: 'select', label: 'Kategori', placeholder: 'Seçiniz…' },
    { type: 'textarea', label: 'Notlar', placeholder: 'Açıklama…' },
  ];
  return (
    <div className={s.mockInner}>
      <div className={s.formBuilder}>
        <div className={s.fbToolbar}>
          <span className={s.fbChip}>Metin</span>
          <span className={s.fbChip}>E-posta</span>
          <span className={s.fbChip}>Seçim</span>
          <span className={s.fbChipPrimary}>+ Alan Ekle</span>
        </div>
        <div className={s.fbCanvas}>
          {fields.map((f) => (
            <div key={f.label} className={s.fbField}>
              <span className={s.fbLabel}>{f.label}</span>
              {f.type === 'textarea' ? (
                <div className={`${s.fbInput} ${s.fbTextarea}`}>{f.placeholder}</div>
              ) : (
                <div className={s.fbInput}>{f.placeholder}</div>
              )}
            </div>
          ))}
          <div className={s.fbSubmit}>Gönder</div>
        </div>
      </div>
    </div>
  );
}

function TemaMockup() {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f87171'];
  const fonts = ['Inter', 'Manrope', 'Poppins'];
  return (
    <div className={s.mockInner}>
      <div className={s.themeEditor}>
        <div className={s.tePanel}>
          <span className={s.mockLabel}>Renkler</span>
          <div className={s.teColors}>
            {colors.map((c) => (
              <span key={c} className={s.teColor} style={{ background: c }} />
            ))}
          </div>
          <span className={s.mockLabel} style={{ marginTop: 12 }}>Font</span>
          <div className={s.teFonts}>
            {fonts.map((f) => (
              <span key={f} className={s.teFont}>{f}</span>
            ))}
          </div>
          <div className={s.tePublish}>Yayınla →</div>
        </div>
        <div className={s.tePreview}>
          <div className={s.tePrevBar}>
            <div className={s.tePrevDots}><span /><span /><span /></div>
          </div>
          <div className={s.tePrevBody}>
            <div className={s.tePrevHero} />
            <div className={s.tePrevGrid}>
              <div className={s.tePrevCard} />
              <div className={s.tePrevCard} />
              <div className={s.tePrevCard} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, React.ReactNode> = {
  eticaret: <EticaretMockup />,
  crm: <CrmMockup />,
  hr: <HrMockup />,
  studyo: <StudyoMockup />,
  tema: <TemaMockup />,
};

export function OzelliklerPage() {
  useScrollReveal();
  useTilt('.tilt');
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
            <div className={`${s.tabViz} tilt`}>
              <div className={s.mockup}>
                <div className={s.mockupBar}>
                  <div className={s.mockupDots}><span /><span /><span /></div>
                  <span className={s.mockupPath}>{activeTab}.wixi.app</span>
                </div>
                <div className={s.mockupBody}>
                  {MOCKUPS[activeTab]}
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
              <div key={e.title} className={`${s.extraCard} lp-glass lp-sweep fade-up`} data-delay={String(i % 3)}>
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
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg" data-magnet>Ücretsiz Başla →</a>
              <a href="/fiyatlandirma" className="lp-btn lp-btn--ghost lp-btn--lg" data-magnet>Planları Gör</a>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
