import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './ModullerPage.module.css';

type Mod = { id: string; name: string; cat: string; price: number; desc: string; tag?: string };

const FEATURED: Mod[] = [
  { id: 'eticaret', name: 'E-Ticaret', cat: 'satis', price: 499, desc: 'Online mağaza, ürün, sipariş, stok ve tema editörü. Mağazanızı dakikalar içinde açın.', tag: 'popular' },
  { id: 'crm', name: 'CRM', cat: 'satis', price: 399, desc: 'Müşteri ilişkileri, fırsat yönetimi, kampanyalar. 360° müşteri profili tek panelde.', tag: 'popular' },
  { id: 'muhasebe', name: 'Muhasebe', cat: 'finans', price: 349, desc: 'E-fatura, gelir-gider, KDV beyannamesi. GİB entegrasyonu ile uyumlu.', tag: 'new' },
];

type CatDef = { id: string; label: string; desc: string; color: string; mods: Mod[] };

const CATS: CatDef[] = [
  { id: 'satis', label: 'Satış & Pazarlama', desc: 'Mağaza, müşteri, kampanya — satış hattını uçtan uca yönetin.', color: '#8b5cf6', mods: [
    { id: 'eticaret', name: 'E-Ticaret', cat: 'satis', price: 499, desc: 'Online mağaza, ürün, sipariş, stok yönetimi', tag: 'popular' },
    { id: 'crm', name: 'CRM', cat: 'satis', price: 399, desc: 'Müşteri yönetimi, fırsat takibi, kampanyalar', tag: 'popular' },
    { id: 'email', name: 'E-posta Pazarlama', cat: 'satis', price: 199, desc: 'Kampanya tasarımı, otomasyonlar, A/B test' },
    { id: 'sms', name: 'SMS Pazarlama', cat: 'satis', price: 149, desc: 'Toplu SMS, OTP, kampanya bildirimleri' },
    { id: 'seo', name: 'SEO Yöneticisi', cat: 'satis', price: 249, desc: 'Anahtar kelime takibi, meta yönetimi, sitemap', tag: 'new' },
    { id: 'social', name: 'Sosyal Medya', cat: 'satis', price: 199, desc: 'Instagram, Facebook, X — planla & yayınla' },
    { id: 'marketplace', name: 'Pazaryeri', cat: 'satis', price: 299, desc: 'Trendyol, Hepsiburada, N11 senkronizasyonu' },
    { id: 'affiliate', name: 'Affiliate', cat: 'satis', price: 179, desc: 'Partner ağı, komisyon takibi, link üretici', tag: 'beta' },
  ]},
  { id: 'ik', label: 'İnsan Kaynakları', desc: 'Personel, izin, bordro ve performans yönetimi.', color: '#06b6d4', mods: [
    { id: 'personel', name: 'Personel Yönetimi', cat: 'ik', price: 299, desc: 'Sicil, özlük, organizasyon şeması' },
    { id: 'izin', name: 'İzin & Vardiya', cat: 'ik', price: 149, desc: 'Onay akışı, takvim, fazla mesai' },
    { id: 'bordro', name: 'Bordro & SGK', cat: 'ik', price: 249, desc: 'Otomatik bordro, SGK e-bildirge' },
    { id: 'performans', name: 'Performans', cat: 'ik', price: 199, desc: '360° değerlendirme, OKR/KPI takibi' },
    { id: 'iseAlim', name: 'İşe Alım (ATS)', cat: 'ik', price: 179, desc: 'Pozisyon, başvuru havuzu, mülakat' },
  ]},
  { id: 'finans', label: 'Finans', desc: 'Muhasebe, fatura, KDV — finansal süreçlerin tamamı.', color: '#10b981', mods: [
    { id: 'muhasebe', name: 'Muhasebe', cat: 'finans', price: 349, desc: 'E-fatura, ön muhasebe, GİB entegrasyonu', tag: 'new' },
    { id: 'fatura', name: 'Fatura Yönetimi', cat: 'finans', price: 149, desc: 'E-fatura, e-arşiv, otomatik takip' },
    { id: 'gelirGider', name: 'Gelir-Gider', cat: 'finans', price: 99, desc: 'Kasa, banka, nakit akışı görselleri' },
    { id: 'kdv', name: 'KDV Beyannamesi', cat: 'finans', price: 149, desc: 'Otomatik KDV-1/2 hazırlama, BA-BS' },
    { id: 'butce', name: 'Bütçe & Tahmin', cat: 'finans', price: 199, desc: 'Aylık bütçe, sapma analizi, forecast' },
  ]},
  { id: 'stok', label: 'Stok & Lojistik', desc: 'Stok, depo, kargo, barkod — operasyonun fiziksel akışı.', color: '#f59e0b', mods: [
    { id: 'stok', name: 'Stok Yönetimi', cat: 'stok', price: 199, desc: 'Çoklu lokasyon, sayım, kritik seviye uyarı' },
    { id: 'depo', name: 'Depo & Lokasyon', cat: 'stok', price: 149, desc: 'Raf, koridor bazlı yerleşim, transfer' },
    { id: 'kargo', name: 'Kargo Entegrasyonu', cat: 'stok', price: 129, desc: 'Aras, Yurtiçi, MNG, PTT — etiket basma' },
    { id: 'barkod', name: 'Barkod & Etiket', cat: 'stok', price: 99, desc: 'QR, barkod tasarımı, toplu yazdırma' },
    { id: 'tedarik', name: 'Tedarik Zinciri', cat: 'stok', price: 249, desc: 'Tedarikçi, sipariş tahminleri, lead time', tag: 'beta' },
  ]},
  { id: 'destek', label: 'Müşteri Hizmetleri', desc: 'Müşteri destek operasyonu için araçlar.', color: '#ec4899', mods: [
    { id: 'chat', name: 'Canlı Destek', cat: 'destek', price: 129, desc: 'Mağazanıza chat balonu, agent yönetimi' },
    { id: 'ticket', name: 'Bilet Sistemi', cat: 'destek', price: 149, desc: 'SLA, atama, kategoriler, otomasyon' },
    { id: 'kb', name: 'Bilgi Bankası', cat: 'destek', price: 79, desc: 'Public FAQ, makale yönetimi, arama' },
    { id: 'callcenter', name: 'Çağrı Merkezi', cat: 'destek', price: 299, desc: 'VoIP, IVR, çağrı kayıtları, anketler', tag: 'coming' },
  ]},
  { id: 'uretim', label: 'Üretim & Operasyon', desc: 'Üretim atölyeleri için planlama, kalite ve bakım modülleri.', color: '#ef4444', mods: [
    { id: 'planning', name: 'Üretim Planlama', cat: 'uretim', price: 299, desc: 'İş emri, kapasite, Gantt görselleri' },
    { id: 'bom', name: 'BOM & Reçete', cat: 'uretim', price: 199, desc: 'Hammadde tüketim, çok seviyeli reçete' },
    { id: 'kalite', name: 'Kalite Kontrol', cat: 'uretim', price: 179, desc: 'Checklist, hata kategorileri, raporlar' },
    { id: 'bakim', name: 'Bakım Yönetimi', cat: 'uretim', price: 149, desc: 'Periyodik bakım, arıza kayıtları' },
  ]},
  { id: 'verim', label: 'Verimlilik', desc: 'Ekip çalışma araçları — notlar, görevler, dokümanlar.', color: '#6366f1', mods: [
    { id: 'notes', name: 'Notlar', cat: 'verim', price: 79, desc: 'Ekip notları, etiketleme, arama' },
    { id: 'tasks', name: 'Görev Takibi', cat: 'verim', price: 99, desc: 'Kanban, sprint, atama, bağımlılıklar' },
    { id: 'meetings', name: 'Toplantı Yönetimi', cat: 'verim', price: 129, desc: 'Takvim, ajanda, otomatik notlar' },
    { id: 'docs', name: 'Belge Yönetimi', cat: 'verim', price: 99, desc: 'Sözleşmeler, izinler, versiyonlama' },
  ]},
];

const TB_CATS = [
  { id: 'all', label: 'Tümü', cnt: 35 },
  { id: 'satis', label: 'Satış & Pazarlama', cnt: 8 },
  { id: 'ik', label: 'İnsan Kaynakları', cnt: 5 },
  { id: 'finans', label: 'Finans', cnt: 5 },
  { id: 'stok', label: 'Stok & Lojistik', cnt: 5 },
  { id: 'destek', label: 'Müşteri Hizmetleri', cnt: 4 },
  { id: 'uretim', label: 'Üretim', cnt: 4 },
  { id: 'verim', label: 'Verimlilik', cnt: 4 },
];

const ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

function TagBadge({ tag }: { tag?: string }) {
  if (!tag) return null;
  if (tag === 'popular') return <span className={`${s.tag} ${s.tagPopular}`}>★</span>;
  if (tag === 'new') return <span className={`${s.tag} ${s.tagNew}`}>Yeni</span>;
  if (tag === 'beta') return <span className={`${s.tag} ${s.tagBeta}`}>Beta</span>;
  if (tag === 'coming') return <span className={`${s.tag} ${s.tagComing}`}>Yakında</span>;
  return null;
}

export function ModullerPage() {
  useScrollReveal();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();

  const visibleCats = CATS.filter((cat) => {
    if (filter !== 'all' && cat.id !== filter) return false;
    if (q) return cat.mods.some((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
    return true;
  }).map((cat) => ({
    ...cat,
    mods: q ? cat.mods.filter((m) => m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)) : cat.mods,
  }));

  const totalVisible = visibleCats.reduce((acc, c) => acc + c.mods.length, 0);

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Modül Kataloğu</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">35+ modül, <span className="lp-grad-text">sınırsız kombinasyon</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Sadece kullandığınız modüller için ödeyin. İhtiyacınız değiştiğinde tek tıkla açın/kapatın — kurulum yok.</p>
        </div>
      </section>

      <div className="lp-container">
        <div className={s.toolbar}>
          <div className={s.toolbarRow}>
            <div className={s.tbSearch}>
              <span className={s.tbSearchIc}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className={s.tbSearchInput} type="search" placeholder="Modül arayın..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className={s.tbCats}>
              {TB_CATS.map((tc) => (
                <button key={tc.id} className={`${s.tbBtn} ${filter === tc.id ? s.tbBtnOn : ''}`} onClick={() => setFilter(tc.id)}>
                  {tc.label} <span className={s.tbCnt}>{tc.cnt}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={s.tbSummary}>
            <div><strong>{totalVisible}</strong> modül gösteriliyor</div>
          </div>
        </div>
      </div>

      <section className={s.featured}>
        <div className="lp-container">
          <div className={s.featHead}>
            <h2>⭐ Popüler</h2>
            <span className={s.lbl}>En çok kullanılan 3 modül</span>
          </div>
          <div className={s.featGrid}>
            {FEATURED.map((f) => (
              <article key={f.id} className={`${s.featCard} lp-glass`}>
                <div className={s.featTop}>
                  <div className={s.featIc}>{ICON}</div>
                  <div>{f.tag === 'popular' && <span className={`${s.tag} ${s.tagPopular}`}>★ Popüler</span>}{f.tag === 'new' && <span className={`${s.tag} ${s.tagNew}`}>Yeni</span>}</div>
                </div>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
                <div className={s.featFoot}>
                  <div className={s.pricePill}><b>₺{f.price}</b><span>/ay</span></div>
                  <button className={s.installBtn}>Ekle</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cats}>
        <div className="lp-container">
          {visibleCats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed var(--lp-border)', borderRadius: 18, color: 'var(--lp-text-muted)' }}>
              <p style={{ margin: 0 }}>Aramanız veya filtrenizle eşleşen modül yok.</p>
            </div>
          )}
          {visibleCats.map((cat) => (
            <div key={cat.id} className={`${s.catSection} ${s[`catSec-${cat.id}` as keyof typeof s] || ''}`} id={cat.id}>
              <div className={s.catHead}>
                <div className={s.catTitle}>
                  <span className={s.catSwatch} style={{ background: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
                  <h2>{cat.label}</h2>
                  <span className={s.catCnt}>{cat.mods.length} modül</span>
                </div>
              </div>
              <p className={s.catDesc}>{cat.desc}</p>
              <div className={s.modGrid}>
                {cat.mods.map((mod) => (
                  <article key={mod.id} className={`${s.modCard} lp-glass`}>
                    <div className={s.modRow}>
                      <div className={s.modIc} style={{ color: cat.color }}>{ICON}</div>
                      <button className={s.addBtn} style={{ fontSize: 18 }}>+</button>
                    </div>
                    <h4>{mod.name} <TagBadge tag={mod.tag} /></h4>
                    <p>{mod.desc}</p>
                    <div className={s.modFoot}>
                      <div className={s.modPrice}><b>₺{mod.price}</b><span>/ay</span></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.bundles}>
        <div className="lp-container">
          <div className={s.bundlesHead}>
            <span className="lp-eyebrow fade-up"><span className="lp-dot" />Hazır Paketler</span>
            <h2 className="fade-up" data-delay="1">35 modül fazla mı? <span className="lp-grad-text">Hazır paketle başlayın.</span></h2>
            <p className="fade-up" data-delay="2">Sektörünüze özel önerilmiş modül kombinasyonları. İstediğiniz an düzenleyin.</p>
          </div>
          <div className={s.bundleGrid}>
            {[
              { icons: ['🛒','📦','🚚'], title: 'E-Ticaret Paketi', count: '3 modül · E-Ticaret + Stok + Kargo', desc: 'Online satışa hızla başlamak isteyen mağazalar için.', price: '699', strike: '₺827', save: '−%15', delay: '0', featured: false },
              { icons: ['👥','📧','📱'], title: 'Satış & CRM Paketi', count: '3 modül · CRM + E-posta + SMS', desc: 'Müşteri ilişkileri ve pazarlamayı otomatikleştirin.', price: '599', strike: '₺747', save: '−%20', delay: '1', featured: false },
              { icons: ['👤','💼','📅'], title: 'İK Paketi', count: '3 modül · Personel + Bordro + İzin', desc: 'İK operasyonunu tek panelden yönetin.', price: '549', strike: '₺697', save: '−%21', delay: '2', featured: false },
              { icons: ['🌟','🛒','👥','💼','📊'], title: 'Tam Paket', count: '35 modül · Hepsi dahil', desc: 'Premium plana eşdeğer — Wixi\'nin tüm modülleri.', price: '1.299', strike: '₺6.500+', save: '−%80', delay: '3', featured: true },
            ].map((b) => (
              <article key={b.title} className={`${s.bundle} lp-glass fade-up ${b.featured ? s.bundleFeatured : ''}`} data-delay={b.delay}>
                <div className={s.bundleIcons}>{b.icons.map((ic, i) => <span key={i}>{ic}</span>)}</div>
                <h3>{b.title} {b.featured && <span className={`${s.tag} ${s.tagPopular}`} style={{ marginLeft: 6 }}>★</span>}</h3>
                <span className={s.bundleCount}>{b.count}</span>
                <p>{b.desc}</p>
                <div className={s.bundlePrice}>
                  <span>₺</span><b>{b.price}</b><span>/ay</span>
                  <span className={s.bundleStrike}>{b.strike}</span>
                  <span className={s.bundleSave}>{b.save}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>İhtiyacınız olanı seçin. <span className="lp-grad-text">Hemen başlayın.</span></h2>
            <p>14 gün ücretsiz deneyin. İstediğiniz modülü ekleyip çıkartın — risk yok.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Başla →</a>
              <Link to="/fiyatlandirma" className="lp-btn lp-btn--ghost lp-btn--lg">Planları Gör</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
