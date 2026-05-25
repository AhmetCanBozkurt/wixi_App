import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './YolHaritasiPage.module.css';

type RmItem = { title: string; cat: string; desc: string; date: string; votes: string; shipped?: boolean; now?: boolean };
type RmCol = { id: string; label: string; status: string; colClass: string; items: RmItem[] };

const COLS: RmCol[] = [
  {
    id: 'shipped', label: 'Tamamlandı', status: 'Q4 2025', colClass: s.colShipped,
    items: [
      { title: 'Stüdyo Modülü', cat: 'Yeni Modül', desc: 'Sürükle-bırak form + akış builder, AI form üretici, 30+ component.', date: '15 Mayıs 2026', votes: '✓ Yayında', shipped: true },
      { title: 'Mobil Yönetici App', cat: 'Platform', desc: 'iOS + Android, sipariş yönetimi, push bildirim.', date: 'Mart 2026', votes: '✓ Yayında', shipped: true },
      { title: 'Çok Dilli Yönetim', cat: 'Lokalizasyon', desc: '12 dilde mağaza yönetimi, otomatik çeviri.', date: 'Şubat 2026', votes: '✓ Yayında', shipped: true },
    ],
  },
  {
    id: 'now', label: 'Şimdi', status: 'Q1 2026', colClass: s.colNow,
    items: [
      { title: 'Muhasebe Modülü', cat: 'Yeni Modül', desc: 'E-fatura, gelir-gider, KDV beyannamesi, GİB entegrasyonu.', date: 'Beklenen: Mayıs 2026', votes: '▲ 847', now: true },
      { title: 'API Marketplace', cat: 'Geliştirici', desc: '3. parti geliştiriciler için modül marketplace.', date: 'Beklenen: Haziran 2026', votes: '▲ 423' },
      { title: 'Çağrı Merkezi Beta', cat: 'Yeni Modül', desc: 'VoIP, IVR, çağrı kayıtları — destek operasyonu için.', date: 'Beklenen: Haziran 2026', votes: '▲ 312' },
    ],
  },
  {
    id: 'next', label: 'Sırada', status: 'Q2 2026', colClass: s.colNext,
    items: [
      { title: 'Üretim Modülü', cat: 'Yeni Modül', desc: 'İş emri, BOM, kalite kontrol — atölye ve üretici KOBİ\'ler için.', date: 'Q3 2026', votes: '▲ 568' },
      { title: 'AI Asistan', cat: 'AI', desc: 'Panelinize özel: "Geçen ay en çok satan ne?" tarzı sohbet.', date: 'Q3 2026', votes: '▲ 1.2K' },
      { title: 'KOBİ Kredi Modülü', cat: 'Finans', desc: 'Bankalar ile entegre kredi başvuru ve takip.', date: 'Q3 2026', votes: '▲ 289' },
      { title: 'White-label', cat: 'Kurumsal', desc: 'Tam markalama, kendi domainde sunum.', date: 'Q3 2026', votes: '▲ 178' },
    ],
  },
  {
    id: 'later', label: 'Daha sonra', status: '2026+', colClass: s.colLater,
    items: [
      { title: 'Mağaza POS', cat: 'Donanım', desc: 'Fiziksel mağaza için Wixi-uyumlu POS terminali.', date: '2027', votes: '▲ 92' },
      { title: 'Wixi Akademi', cat: 'Eğitim', desc: 'KOBİ sahipleri için ücretsiz online eğitim platformu.', date: '2027', votes: '▲ 156' },
      { title: 'Marketplace Listesi', cat: 'Pazarlama', desc: 'Wixi mağazalarının sergilendiği marka pazaryeri.', date: '2027', votes: '▲ 64' },
    ],
  },
];

const CHANGELOG = [
  { version: 'v2.8.0', date: 'Mayıs 2026', title: 'Stüdyo AI Form Üretici', tag: 'feature', tagLabel: 'Yeni Özellik', desc: 'Türkçe açıklama ile saniyeler içinde hazır form oluşturun. Alan tipleri, doğrulama kuralları ve zorunluluklar otomatik belirlenir.' },
  { version: 'v2.7.5', date: 'Nisan 2026', title: 'Kargo Entegrasyonu Genişletildi', tag: 'improvement', tagLabel: 'İyileştirme', desc: 'HepsiJET ve UPS Türkiye API entegrasyonu eklendi. Etiket önizleme özelliği geliştirildi.' },
  { version: 'v2.7.2', date: 'Nisan 2026', title: 'Dashboard Hız Optimizasyonu', tag: 'improvement', tagLabel: 'İyileştirme', desc: 'Ana panel yüklenme süresi ortalama %40 azaltıldı. Lazy loading ve veri önbellekleme iyileştirildi.' },
  { version: 'v2.7.0', date: 'Mart 2026', title: 'Mobil Yönetici App v1.0', tag: 'feature', tagLabel: 'Yeni Özellik', desc: 'iOS ve Android için Wixi Yönetici uygulaması yayınlandı. Sipariş yönetimi, stok güncelleme ve CRM bildirimleri destekleniyor.' },
  { version: 'v2.6.8', date: 'Mart 2026', title: 'E-fatura Yazdırma Hatası Düzeltildi', tag: 'fix', tagLabel: 'Düzeltme', desc: 'Bazı tarayıcılarda PDF e-fatura görüntülemede yaşanan boş sayfa sorunu giderildi.' },
];

export function YolHaritasiPage() {
  useScrollReveal();
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const toggleVote = (key: string) => {
    setVoted((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Yol Haritası</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Sırada <span className="lp-grad-text">ne var?</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Wixi'nin yakında nereye gittiğini sizinle paylaşıyoruz. Beğendiğiniz özellikleri oylayın — önceliklendirmemize yardımcı olun.</p>
          <div className={`${s.legend} fade-up`} data-delay="3">
            <span className={`${s.legendItem} ${s.legendShipped}`}><span className={s.legendDot} />Tamamlandı</span>
            <span className={`${s.legendItem} ${s.legendNow}`}><span className={s.legendDot} />Şimdi · Q1 2026</span>
            <span className={`${s.legendItem} ${s.legendNext}`}><span className={s.legendDot} />Sırada · Q2 2026</span>
            <span className={`${s.legendItem} ${s.legendLater}`}><span className={s.legendDot} />Daha sonra</span>
          </div>
        </div>
      </section>

      <section className={s.cols}>
        <div className="lp-container">
          <div className={s.colsGrid}>
            {COLS.map((col, ci) => (
              <div key={col.id} className={`${s.rmCol} lp-glass ${col.colClass} fade-up`} data-delay={String(ci)}>
                <div className={s.rmColHead}>
                  <h3>{col.label}</h3>
                  <span className={s.rmStatus}>{col.status}</span>
                </div>
                {col.items.map((item, ii) => {
                  const key = `${col.id}-${ii}`;
                  const isVoted = voted.has(key);
                  return (
                    <div key={key} className={`${s.rmItem} ${item.shipped ? s.rmItemShipped : ''} ${item.now ? s.rmItemNow : ''}`}>
                      <div className={s.rmItemHead}>
                        <b>{item.shipped ? '✓ ' : ''}{item.title}</b>
                        <span className={s.rmItemCat}>{item.cat}</span>
                      </div>
                      <p>{item.desc}</p>
                      <div className={s.rmItemFoot}>
                        <span className={s.rmItemDate}>{item.date}</span>
                        <button
                          className={`${s.rmVote} ${item.shipped || isVoted ? s.rmVoteDone : ''}`}
                          onClick={() => !item.shipped && toggleVote(key)}
                        >
                          {item.votes}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.beta}>
        <div className="lp-container">
          <div className={`${s.betaCard} fade-up`}>
            <div>
              <span className="lp-eyebrow"><span className="lp-dot" />Beta Programı</span>
              <h3>Yenilikleri herkesten önce deneyin</h3>
              <p>Wixi Beta programına katılarak yeni özellikleri 4-6 hafta önceden test edin, ekibimize doğrudan geri bildirim verin.</p>
              <ul className={s.betaFeatures}>
                {['Erken erişim — yayından 1+ ay önce', 'Ürün ekibiyle aylık görüşme', 'Beta özellikler ücretsiz', 'Yıllık plan %15 indirim'].map((f) => (
                  <li key={f}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.betaCta}>
              <div className={s.betaNum}>142</div>
              <div className={s.betaLbl}>aktif beta üyesi</div>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Beta'ya Katıl →</a>
            </div>
          </div>
        </div>
      </section>

      <section className={s.changes}>
        <div className="lp-container">
          <div className={`${s.changesHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Değişiklik Günlüğü</span>
            <h2>Son <span className="lp-grad-text">güncellemeler</span></h2>
            <p>Her yeni sürümde neler değişti, hangi sorunlar giderildi.</p>
          </div>
          <div className="lp-glass">
            {CHANGELOG.map((c) => (
              <div key={c.version} className={s.changeItem}>
                <div className={s.changeDate}>
                  <b>{c.version}</b>
                  {c.date}
                </div>
                <div className={s.changeBody}>
                  <h4>
                    {c.title}
                    <span className={c.tag === 'feature' ? s.tagFeature : c.tag === 'improvement' ? s.tagImprovement : s.tagFix}>{c.tagLabel}</span>
                  </h4>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ padding: '0 0 100px' }}>
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <Link to="/iletisim" className="lp-btn lp-btn--ghost">Özellik önerisi gönderin →</Link>
        </div>
      </div>
    </LandingLayout>
  );
}
