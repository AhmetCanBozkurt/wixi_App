import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './StudyoPage.module.css';

const COMPONENTS = [
  { name: 'Kısa Metin', type: 'Tek satır', color: '' },
  { name: 'Uzun Metin', type: 'Textarea', color: '' },
  { name: 'E-posta', type: 'Doğrulamalı', color: 'cyan' },
  { name: 'Telefon', type: 'Maskeli', color: 'cyan' },
  { name: 'Sayı', type: 'Range/Step', color: '' },
  { name: 'Tarih', type: 'Calendar', color: 'amber' },
  { name: 'Saat', type: 'Time picker', color: 'amber' },
  { name: 'Tek Seçim', type: 'Radio', color: '' },
  { name: 'Çoklu Seçim', type: 'Checkbox', color: '' },
  { name: 'Açılır Liste', type: 'Dropdown', color: '' },
  { name: 'Yıldız Puanı', type: '1-5 rating', color: 'emerald' },
  { name: 'Slider', type: 'Range bar', color: 'emerald' },
  { name: 'Dosya', type: 'Upload + drop', color: 'pink' },
  { name: 'İmza', type: 'e-imza pad', color: 'pink' },
  { name: 'Adres', type: 'Harita destekli', color: 'cyan' },
  { name: 'Para', type: 'TL/USD/EUR', color: 'cyan' },
  { name: 'Şifre', type: 'Güvenlik', color: 'amber' },
  { name: 'NPS', type: '0-10 skor', color: 'amber' },
  { name: 'Resim', type: 'Görsel yükleme', color: '' },
  { name: 'Video', type: 'MP4/embed', color: '' },
  { name: 'Konum', type: 'GPS', color: 'emerald' },
  { name: 'Kod/HTML', type: 'Embed', color: 'emerald' },
  { name: 'Captcha', type: 'Bot koruması', color: 'pink' },
  { name: 'Bölüm', type: 'Çok adımlı', color: 'pink' },
  { name: 'Tablo', type: 'Sıralı veri', color: 'cyan' },
  { name: 'Conditional', type: 'Akıl', color: 'cyan' },
  { name: 'Hesaplama', type: 'Formula', color: 'amber' },
  { name: 'QR Kod', type: 'Oluştur/tara', color: 'amber' },
  { name: '+ Daha', type: '5 component', color: 'emerald' },
  { name: 'API Bağla', type: 'Webhook', color: 'pink' },
];

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, title: 'AI Form Üretici', desc: 'Türkçe açıkla, saniyeler içinde hazır form — alan tipleri, doğrulama, zorunluluklar otomatik.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, title: 'Sürükle & Bırak', desc: '30+ hazır bileşen — tablolar, kanban, grafikler, ödeme formları. İstediğin gibi sürükle.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, title: 'API Bağlantısı', desc: 'Her modüle sürükle-bırak ile API bağla, veri akışını görsel olarak tasarla.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Rol Bazlı Görünüm', desc: 'Aynı akışı yönetici, personel ve müşteri için farklı şekilde göster.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Zamanlama & Tetikleyici', desc: 'Otomatik e-posta, bildirim ve akış tetikleyicileri oluştur — kod yazmadan.' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Yayın & Versiyon', desc: 'Değişikliklerini taslak olarak kaydet, canlı ortama tek tıkla yayımla.' },
];

const BUILDER_BULLETS = [
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>, title: 'Snap-to-grid', desc: 'Her component otomatik hizalanır, ızgara üzerinde tertemiz.' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, title: 'Anlık canlı önizleme', desc: 'Mobil/tablet/masaüstü görünümünü tek tıkla test edin.' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/><polyline points="6 4 12 10 18 4"/></svg>, title: 'Koşullu mantık', desc: '"Eğer X seçilirse, Y\'yi göster" tarzı dinamik akışlar.' },
  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>, title: 'Otomatik tema', desc: 'Marka rengini seçin, tüm formlar uyum sağlar.' },
];

export function StudyoPage() {
  useScrollReveal();

  return (
    <LandingLayout>
      {/* ── HERO ── */}
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
                <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg" data-magnet>Stüdyo'yu Aç →</a>
                <Link to="/nasil-calisir" className="lp-btn lp-btn--ghost lp-btn--lg">Nasıl Çalışır?</Link>
              </div>
              <div className={`${s.heroFeats} fade-up`} data-delay="4">
                {['30+ hazır bileşen', 'AI form üretici', 'Görsel flow editör', '40+ şablon'].map((f) => (
                  <span key={f}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Visual — AI Canvas */}
            <div className={`${s.heroViz} scale-in`} data-delay="1">
              {/* Floating chips */}
              <div className={`${s.floatComp} ${s.floatComp1}`}>
                <span className={s.floatIc}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg></span>
                E-posta alanı
              </div>
              <div className={`${s.floatComp} ${s.floatComp2}`}>
                <span className={s.floatIc}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                Onay kutusu
              </div>
              <div className={`${s.floatComp} ${s.floatComp3}`}>
                <span className={s.floatIc}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
                Dosya yükleme
              </div>

              <div className={s.canvas}>
                <div className={s.canvasBar}>
                  <div className={s.canvasDots}><span /><span /><span /></div>
                  <span className={s.canvasPath}>wixi.app / stüdyo / yeni-form</span>
                  <span className={s.canvasLive}>CANLI</span>
                </div>
                <div className={s.canvasBody}>
                  <div className={s.aiPrompt}>
                    <div className={s.aiPromptIc}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>
                    </div>
                    <div className={s.aiPromptTxt}>
                      İletişim formu oluştur — ad, e-posta, bütçe, mesaj
                      <span className={s.cursor} />
                    </div>
                    <button className={s.aiPromptSend}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                  <div className={s.aiStatus}>
                    <span className={s.spin} />
                    AI bileşenleri oluşturuyor...
                  </div>
                  <div className={s.genForm}>
                    {[
                      { lbl: 'Ad Soyad *', type: 'text' },
                      { lbl: 'E-posta', type: 'email' },
                      { lbl: 'Bütçe Aralığı', type: 'radio' },
                      { lbl: 'Mesajınız', type: 'textarea' },
                      { lbl: 'KVKK onayı *', type: 'checkbox' },
                    ].map((f, i) => (
                      <div key={f.lbl} className={`${s.genField} ${s.genFieldIn}`} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
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

      {/* ── COMPONENTS LIBRARY ── */}
      <section className={s.lib}>
        <div className="lp-container">
          <div className={s.libHead}>
            <div className={s.libCount}><b>30+</b><span>hazır bileşen</span></div>
            <h2>Her form için <span className="lp-grad-text">doğru parça</span></h2>
            <p>Basit input'lardan koşullu mantığa, dosya yüklemeden imza alanına — düşündüğünüz her şey hazır.</p>
          </div>
          <div className={s.libGrid}>
            {COMPONENTS.map((c, i) => (
              <div key={c.name} className={`${s.compTile} ${c.color ? s[`tile${c.color.charAt(0).toUpperCase() + c.color.slice(1)}` as keyof typeof s] ?? '' : ''} lp-glass fade-up`} data-delay={String(i % 5)}>
                <div className={s.compTileIc}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <strong>{c.name}</strong>
                <span>{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILDER IDE ── */}
      <section className={s.builder}>
        <div className="lp-container">
          <div className={s.builderShell}>
            {/* Copy */}
            <div className={`${s.builderCopy} slide-in-l`}>
              <span className="lp-eyebrow" style={{ marginBottom: 16 }}><span className="lp-dot" />Sürükle-Bırak Builder</span>
              <h2>İstediğiniz formu <span className={s.builderGrad}>5 dakikada</span> kurun</h2>
              <p className={s.builderLead}>Solda 30+ component, sağda canlı önizleme. Sürükleyin, bırakın, ayarları açın. Kod tek satır yok.</p>
              <ul className={s.builderBullets}>
                {BUILDER_BULLETS.map((b) => (
                  <li key={b.title}>
                    <span className={s.bIc}>{b.icon}</span>
                    <div><b>{b.title}</b><span>{b.desc}</span></div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Builder IDE Mockup */}
            <div className={`${s.builderViz} slide-in-r`}>
              {/* Toolbar */}
              <div className={s.builderToolbar}>
                <div className={s.tbLeft}>
                  <div className={s.tbFormName}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#8b5cf6' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    <span>İletişim Formu</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lp-text-dim)' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  </div>
                  <span className={s.tbPath}>3 alan · 2. sayfa</span>
                </div>
                <div className={s.tbViewport}>
                  <button className={s.tbVpOn}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></button>
                  <button><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg></button>
                  <button><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="2" width="12" height="20" rx="2"/></svg></button>
                </div>
                <div className={s.tbActions}>
                  <button className={s.tbBtn}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg></button>
                  <button className={`${s.tbBtn} ${s.tbBtnDisabled}`}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg></button>
                  <button className={s.tbPublish}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>YAYINLA</button>
                </div>
              </div>

              {/* Sidebar */}
              <aside className={s.builderSidebar}>
                <div className={s.sidebarSearch}>
                  <span className={s.sidebarSearchIc}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                  <input type="text" placeholder="Component ara..." readOnly />
                  <span className={s.kbdMini}>/</span>
                </div>
                <h4 className={s.sidebarH4}>Temel <span className={s.sidebarCnt}>5</span></h4>
                {['Kısa Metin', 'Uzun Metin', 'E-posta', 'Sayı'].map((item, i) => (
                  <div key={item} className={`${s.sidebarItem} ${i === 0 ? s.sidebarItemDragging : ''}`}>
                    <span className={s.sidebarIc}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="14" y2="15"/></svg></span>
                    {item}
                  </div>
                ))}
                <h4 className={s.sidebarH4}>Seçim <span className={s.sidebarCnt}>4</span></h4>
                {['Tek Seçim', 'Çoklu Seçim', 'Açılır Liste'].map((item) => (
                  <div key={item} className={s.sidebarItem}>
                    <span className={s.sidebarIc}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9"/></svg></span>
                    {item}
                  </div>
                ))}
              </aside>

              {/* Ghost drag animation */}
              <div className={s.ghostDrag}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="14" y2="15"/></svg>
                Kısa Metin
              </div>

              {/* Canvas */}
              <div className={s.builderCanvas}>
                <div className={s.canvasPages}>
                  <b>2 / 3</b>
                  <span>· İletişim Bilgileri</span>
                </div>

                <div className={s.canvasField}>
                  <div className={s.fieldHead}>
                    <b>Ad Soyad <span className={s.req}>*</span></b>
                    <div className={s.fieldActions}>
                      <button><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                      <button><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></button>
                    </div>
                  </div>
                  <div className={s.inputMock} />
                </div>

                <div className={`${s.canvasField} ${s.canvasFieldSelected}`}>
                  <div className={s.fieldHead}>
                    <b>E-posta <span className={s.req}>*</span> <span className={s.badgeAi}>AI</span></b>
                    <div className={`${s.fieldActions} ${s.fieldActionsVisible}`}>
                      <button><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                      <button><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg></button>
                    </div>
                  </div>
                  <div className={s.inputMock} />
                </div>

                <div className={s.canvasField}>
                  <div className={s.fieldHead}><b>Bütçe Aralığı</b></div>
                  <div className={s.optRow}><span className={s.radio} /><span>₺0 — ₺5.000</span></div>
                  <div className={`${s.optRow} ${s.optRowSel}`}><span className={s.radio} /><span>₺5.000 — ₺25.000</span></div>
                  <div className={s.optRow}><span className={s.radio} /><span>₺25.000+</span></div>
                </div>

                <div className={s.canvasField}>
                  <div className={s.fieldHead}>
                    <b>Detay Mesaj</b>
                    <span className={s.badgeCond}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>KOŞULLU</span>
                  </div>
                  <div className={`${s.inputMock} ${s.inputMockTextarea}`} />
                </div>

                <div className={s.canvasDrop}>
                  <span className={s.dropPlus}>+</span>
                  Yeni component ekle veya soldan sürükleyin
                </div>
              </div>

              {/* Inspector */}
              <aside className={s.builderInspector}>
                <div className={s.inspTabs}>
                  <button className={s.inspTabOn}>Ayarlar</button>
                  <button>Mantık</button>
                  <button>Stil</button>
                </div>
                <div className={s.inspSection}>
                  <h5 className={s.inspH5}>Alan</h5>
                  <div className={s.inspRow}>
                    <label>Etiket</label>
                    <input type="text" defaultValue="E-posta" readOnly />
                  </div>
                  <div className={s.inspRow}>
                    <label>Yer tutucu</label>
                    <input type="text" defaultValue="ad@isletme.com" readOnly />
                  </div>
                </div>
                <div className={s.inspSection}>
                  <h5 className={s.inspH5}>Doğrulama</h5>
                  <div className={s.inspSwitch}><span>Zorunlu</span><button className={`${s.inspToggle} ${s.inspToggleOn}`} /></div>
                  <div className={s.inspSwitch}><span>E-posta formatı</span><button className={`${s.inspToggle} ${s.inspToggleOn}`} /></div>
                  <div className={s.inspSwitch}><span>Şirket alan adı</span><button className={s.inspToggle} /></div>
                </div>
                <div className={s.inspSection}>
                  <h5 className={s.inspH5}>Görünürlük</h5>
                  <div className={s.inspCond}>
                    <b>Eğer</b> <code>Bütçe</code> = <code>₺5K+</code><br />
                    <b>ise göster</b>: bu alan
                  </div>
                </div>
              </aside>

              {/* Status bar */}
              <div className={s.builderStatus}>
                <div className={s.statusLeft}>
                  <span className={s.saveOk}>Kaydedildi</span>
                  <span>v1.4</span>
                  <span>3 alan · 2 koşul</span>
                </div>
                <div className={s.statusRight}>
                  <span>1024 × 720</span>
                  <span>%100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOW BUILDER ── */}
      <section className={s.flow}>
        <div className="lp-container">
          <div className={`${s.flowHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Akış Editör</span>
            <h2>Form gönderildi. <span className="lp-grad-text">Şimdi ne olur?</span></h2>
            <p>Görsel akış editörüyle "if-then-else" mantığı kurun. CRM lead'i oluştur, e-posta gönder, Slack'e bildir, fatura kes.</p>
          </div>

          <div className={`${s.flowCanvas} fade-up`} data-delay="1">
            <svg className={s.flowSvg} viewBox="0 0 1000 420" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M 240 130 Q 290 130, 320 130" />
              <path d="M 500 130 Q 650 80, 750 100" />
              <path d="M 500 130 Q 600 200, 700 270" />
              <path d="M 410 180 Q 380 220, 300 290" />
              <circle r="3" className={s.flowDot}>
                <animateMotion dur="4s" repeatCount="indefinite" path="M 240 130 Q 290 130, 320 130" />
              </circle>
              <circle r="3" className={s.flowDot}>
                <animateMotion dur="5s" repeatCount="indefinite" begin="1.5s" path="M 500 130 Q 650 80, 750 100" />
              </circle>
              <circle r="3" className={s.flowDot}>
                <animateMotion dur="5s" repeatCount="indefinite" begin="3s" path="M 500 130 Q 600 200, 700 270" />
              </circle>
            </svg>

            {/* Trigger node */}
            <div className={`${s.flowNode} ${s.flowNodeTrigger}`}>
              <div className={s.flowNodeHead}>
                <div className={`${s.flowNodeIc} ${s.flowNodeIcGreen}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <div><div className={s.flowNodeLbl}>Tetikleyici</div><h5>Form gönderildi</h5></div>
              </div>
              <p>İletişim formu cevaplandığında</p>
              <span className={`${s.port} ${s.portRight}`} />
            </div>

            {/* Condition node */}
            <div className={`${s.flowNode} ${s.flowNodeCond}`}>
              <span className={`${s.port} ${s.portLeft}`} />
              <div className={s.flowNodeHead}>
                <div className={`${s.flowNodeIc} ${s.flowNodeIcAmber}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                <div><div className={s.flowNodeLbl}>Koşul</div><h5>Bütçe &gt; ₺10K mı?</h5></div>
              </div>
              <p>Cevaba göre dallandır</p>
              <span className={`${s.port} ${s.portRight}`} />
            </div>

            {/* CRM node */}
            <div className={`${s.flowNode} ${s.flowNodeCrm}`}>
              <span className={`${s.port} ${s.portLeft}`} />
              <div className={s.flowNodeHead}>
                <div className={`${s.flowNodeIc} ${s.flowNodeIcGrad}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg></div>
                <div><div className={s.flowNodeLbl}>CRM</div><h5>Sıcak Lead oluştur</h5></div>
              </div>
              <p>Satış ekibine ata</p>
            </div>

            {/* Email node */}
            <div className={`${s.flowNode} ${s.flowNodeEmail}`}>
              <span className={`${s.port} ${s.portLeft}`} />
              <div className={s.flowNodeHead}>
                <div className={`${s.flowNodeIc} ${s.flowNodeIcCyan}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg></div>
                <div><div className={s.flowNodeLbl}>E-posta</div><h5>Hoş geldin yolla</h5></div>
              </div>
              <p>Otomatik karşılama</p>
            </div>

            {/* Slack node */}
            <div className={`${s.flowNode} ${s.flowNodeSlack}`}>
              <span className={`${s.port} ${s.portRight}`} />
              <div className={s.flowNodeHead}>
                <div className={`${s.flowNodeIc} ${s.flowNodeIcPink}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div><div className={s.flowNodeLbl}>Slack</div><h5>#sales kanalına bildir</h5></div>
              </div>
              <p>Anlık bildirim</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
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

      {/* ── CTA ── */}
      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hayal edin, <span className="lp-grad-text">dakikalarda yapın.</span></h2>
            <p>14 gün ücretsiz deneyin. Kredi kartı gerekmez.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg" data-magnet>Stüdyo'yu Dene →</a>
              <Link to="/moduller" className="lp-btn lp-btn--ghost lp-btn--lg">Tüm Modüller</Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
