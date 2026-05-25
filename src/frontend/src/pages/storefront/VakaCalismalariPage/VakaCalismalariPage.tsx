import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './VakaCalismalariPage.module.css';

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'retail', label: 'Perakende' },
  { id: 'food', label: 'Gıda & Restoran' },
  { id: 'textile', label: 'Tekstil' },
  { id: 'service', label: 'Hizmet' },
  { id: 'manufacture', label: 'Üretim' },
];

type Card = { brand: string; tagLabel: string; cat: string; title: string; desc: string; m1b: string; m1s: string; m2b: string; m2s: string; g: string };

const CARDS: Card[] = [
  { brand: 'NT', tagLabel: 'Tekstil', cat: 'textile', g: 'g1', title: 'NoraTekstil: Stok kaosu yerine senkron çalışan 4 mağaza', desc: '4 fiziksel + 2 online satış kanalı arasında stok senkronizasyonu Wixi ile günde 1 saatten 0\'a indi.', m1b: '%142', m1s: 'Stok doğruluğu', m2b: '−6sa/gün', m2s: 'Manuel iş' },
  { brand: 'AB', tagLabel: 'Gıda', cat: 'food', g: 'g2', title: 'Anadolu Bakery: 5 şubeli zincir, tek panel', desc: 'Şube müdürleri kendi gün sonu raporlarını Wixi\'den hazırlıyor, merkez 5 dakikada konsolide görüyor.', m1b: '5→1', m1s: 'Yazılım azaltma', m2b: '₺18K/ay', m2s: 'Maliyet tasarrufu' },
  { brand: 'SO', tagLabel: 'Perakende', cat: 'retail', g: 'g3', title: 'Sefa Optik: CRM ile müşteri sadakati %62 arttı', desc: 'Reçete yenileme hatırlatmaları otomatize edildi, müşterilerin yıllık ziyareti %62 arttı.', m1b: '%62', m1s: 'Sadakat artışı', m2b: '3.2x', m2s: 'Tekrar satın alma' },
  { brand: 'MS', tagLabel: 'Hizmet', cat: 'service', g: 'g4', title: 'Mimoza Studio: 1 kişiden 8 kişiye, hızla büyüyen tasarım stüdyosu', desc: 'Proje takibi, müşteri faturalandırma ve İK Wixi\'de — yalnızca 3 ayda ekip 8 kişiye çıktı.', m1b: '8x', m1s: 'Ekip büyümesi', m2b: '%95', m2s: 'Vaktinde teslim' },
  { brand: 'AT', tagLabel: 'Üretim', cat: 'manufacture', g: 'g5', title: 'Atlas Spor: Üretimden ödemeye uçtan uca dijital', desc: 'Sipariş geldiği anda iş emri otomatik çıkıyor, hammadde stoğu düşünce uyarı gidiyor.', m1b: '−72sa', m1s: 'Sipariş döngüsü', m2b: '%18', m2s: 'Hata azalması' },
  { brand: 'LC', tagLabel: 'Gıda', cat: 'food', g: 'g6', title: 'Levanten Cafe: Stüdyo modülü ile online rezervasyon', desc: 'Stüdyo\'dan oluşturulan rezervasyon formu CRM ile entegre çalışıyor; masa doluluk oranı %38 arttı.', m1b: '%38', m1s: 'Doluluk artışı', m2b: '0 kod', m2s: 'Entegrasyon' },
];

const ARROW_ICON = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;

export function VakaCalismalariPage() {
  useScrollReveal();
  const [active, setActive] = useState('all');

  const visible = CARDS.filter((c) => active === 'all' || c.cat === active);

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
            {FILTERS.map((f) => (
              <button key={f.id} className={`${s.filterBtn} ${active === f.id ? s.filterBtnOn : ''}`} onClick={() => setActive(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className={s.featured}>
        <div className="lp-container">
          <article className={`${s.featuredCard} fade-up`}>
            <div className={s.featuredVisual}>
              <div className={s.featuredBrand}>KK</div>
              <div className={s.featuredQuote}>
                <p>Wixi sayesinde online satışa geçişimiz 2 günde tamamlandı. Şu an siparişlerin %40'ı online geliyor, üstelik 3 farklı yazılım yerine tek panel kullanıyoruz.</p>
                <div className="who"><b>Ahmet Yılmaz</b> · Kuzey Kahve, Kurucu Ortak</div>
              </div>
            </div>
            <div className={s.featuredBody}>
              <span className={s.featuredTag}>⭐ Öne Çıkan</span>
              <h2>Bir butik kahveci nasıl 3 ay içinde sipariş hacmini ikiye katladı?</h2>
              <p>15 yıllık geleneksel kafe işletmecisi Kuzey Kahve, pandemi sonrası dönüşüm için Wixi'yi tercih etti. E-Ticaret + CRM + Stok modüllerini entegre kullanarak hem fiziksel hem online operasyonu tek panelden yönetmeye başladı.</p>
              <div className={s.featuredResults}>
                <div className={s.csResult}><b>%108</b><span>Sipariş artışı</span></div>
                <div className={s.csResult}><b>₺248K</b><span>Aylık ciro</span></div>
                <div className={s.csResult}><b>−12sa</b><span>Haftalık tasarruf</span></div>
              </div>
              <a href="#" className="lp-btn lp-btn--primary">Detaylı Hikayeyi Okuyun →</a>
            </div>
          </article>
        </div>
      </section>

      <section className={s.grid}>
        <div className="lp-container">
          <div className={s.gridRow}>
            {visible.map((card, i) => (
              <article key={card.brand} className={`${s.csCard} ${s[card.g as keyof typeof s]} lp-glass fade-up`} data-delay={String(i % 3)}>
                <div className={s.csCardTop}>
                  <div className={s.csCardBrand}>{card.brand}</div>
                  <div className={s.csCardTag}>{card.tagLabel}</div>
                </div>
                <div className={s.csCardBody}>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                  <div className={s.csCardMetrics}>
                    <div className={s.csCardMetric}><b>{card.m1b}</b><span>{card.m1s}</span></div>
                    <div className={s.csCardMetric}><b>{card.m2b}</b><span>{card.m2s}</span></div>
                  </div>
                  <a href="#" className={s.csCardLink}>Okuyun {ARROW_ICON}</a>
                </div>
              </article>
            ))}
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
