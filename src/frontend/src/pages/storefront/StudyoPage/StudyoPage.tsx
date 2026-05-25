import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './StudyoPage.module.css';

const COMPONENTS = [
  { name: 'Form Builder', type: 'Giriş' },
  { name: 'Data Table', type: 'Veri' },
  { name: 'Kanban Board', type: 'Görsel' },
  { name: 'Gantt Chart', type: 'Zaman' },
  { name: 'Dashboard', type: 'Analytics' },
  { name: 'File Upload', type: 'Medya' },
  { name: 'Calendar', type: 'Takvim' },
  { name: 'Chat Widget', type: 'İletişim' },
  { name: 'Map View', type: 'Harita' },
  { name: 'Timeline', type: 'Akış' },
  { name: 'Report Card', type: 'Rapor' },
  { name: 'Auth Form', type: 'Güvenlik' },
  { name: 'Checkout', type: 'Ödeme' },
  { name: 'Product Card', type: 'Ürün' },
  { name: 'Email Editor', type: 'E-posta' },
  { name: 'Survey', type: 'Anket' },
  { name: 'Notification', type: 'Bildirim' },
  { name: 'PDF Export', type: 'Belge' },
];

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, title: 'AI Form Üretici', desc: 'Türkçe açıkla, saniyeler içinde hazır form — alan tipleri, doğrulama, zorunluluklar otomatik.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, title: 'Sürükle & Bırak', desc: '100+ hazır bileşen — tablolar, kanban, grafikler, ödeme formları. İstediğin gibi sürükle.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, title: 'API Bağlantısı', desc: 'Her modüle sürükle-bırak ile API bağla, veri akışını görsel olarak tasarla.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Rol Bazlı Görünüm', desc: 'Aynı akışı yönetici, personel ve müşteri için farklı şekilde göster.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Zamanlama & Tetikleyici', desc: 'Otomatik e-posta, bildirim ve akış tetikleyicileri oluştur — kod yazmadan.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Yayın & Versiyon', desc: 'Değişikliklerini taslak olarak kaydet, canlı ortama tek tıkla yayımla.' },
];

export function StudyoPage() {
  useScrollReveal();

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <div className={s.heroGrid}>
            <div>
              <div className={`${s.badge} fade-up`}>
                <span className={s.badgePill}>AI Destekli</span>
                <span className={s.badgeMeta}>Wixi Stüdyo — No-code builder</span>
              </div>
              <h1 className={`${s.h1} fade-up`} data-delay="1">
                Kodlamadan <span className={s.h1Grad}>uygulama</span> yap
              </h1>
              <p className={`${s.lead} fade-up`} data-delay="2">
                Sürükle-bırak arayüzü ile form, akış, dashboard ve dahili araçlar oluştur. AI yazarken sen özelleştirirsin.
              </p>
              <div className={`${s.heroCta} fade-up`} data-delay="3">
                <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Dene →</a>
                <Link to="/nasil-calisir" className="lp-btn lp-btn--ghost lp-btn--lg">Nasıl Çalışır?</Link>
              </div>
              <div className={`${s.heroFeats} fade-up`} data-delay="4">
                {['100+ hazır bileşen', 'AI form üretici', 'API bağlantısı', 'Rol bazlı görünüm'].map((f) => (
                  <span key={f}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className={`${s.heroViz} fade-up`} data-delay="2">
              <div className={s.canvas}>
                <div className={s.canvasBar}>
                  <div className={s.canvasDots}><span /><span /><span /></div>
                  <span className={s.canvasPath}>studio.wixi.app / form-builder</span>
                  <span className={s.canvasLive}>CANLI</span>
                </div>
                <div className={s.canvasBody}>
                  <div className={s.aiPrompt}>
                    <div className={s.aiPromptIc}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                    </div>
                    <div className={s.aiPromptTxt}>Sipariş takip formu oluştur — müşteri bilgileri, ürün, kargo…</div>
                  </div>
                  <div className={s.aiStatus}>
                    <span style={{ width: 14, height: 14, border: '1.5px solid rgba(139,92,246,.4)', borderTopColor: '#8b5cf6', borderRadius: '50%', display: 'inline-block' }} />
                    AI bileşenleri oluşturuyor...
                  </div>
                  <div className={s.genForm}>
                    {[
                      { lbl: 'Müşteri Adı *', type: 'text' },
                      { lbl: 'E-posta', type: 'email' },
                      { lbl: 'Sipariş No', type: 'mono' },
                      { lbl: 'Ürün', type: 'select' },
                      { lbl: 'Not', type: 'textarea' },
                    ].map((f) => (
                      <div key={f.lbl} className={s.genField}>
                        <div className={s.genFieldLbl}>
                          <span>{f.lbl}</span>
                          <span className={s.genFieldType}>{f.type}</span>
                        </div>
                        <div className={s.genFieldPh} style={{ height: f.type === 'textarea' ? 34 : 10 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.lib}>
        <div className="lp-container">
          <div className={s.libHead}>
            <div className={s.libCount}><b>100+</b><span>hazır bileşen</span></div>
            <h2>Sürükle, bırak, <span className="lp-grad-text">yayımla</span></h2>
            <p>Formdan panoya, ödeme ekranından raporlara — tüm bileşenler hazır. İstediğini seç, özelleştir, kullan.</p>
          </div>
          <div className={s.libGrid}>
            {COMPONENTS.map((c, i) => (
              <div key={c.name} className={`${s.compTile} lp-glass fade-up`} data-delay={String(i % 6)}>
                <div className={s.compTileIc}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <strong>{c.name}</strong>
                <span>{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.features}>
        <div className="lp-container">
          <div className={`${s.featuresHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Özellikler</span>
            <h2>Her şey <span className="lp-grad-text">dahil</span></h2>
          </div>
          <div className={s.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`${s.featureCard} lp-glass fade-up`} data-delay={String(i % 3)}>
                <div className={s.featureIc}>{f.icon}</div>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hayal edin, <span className="lp-grad-text">dakikalarda yapın.</span></h2>
            <p>14 gün ücretsiz deneyin. Kredi kartı gerekmez.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Stüdyo'yu Dene →</a>
              <Link to="/moduller" className="lp-btn lp-btn--ghost lp-btn--lg">Tüm Modüller</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
