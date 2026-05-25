import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './SssPage.module.css';

const CATS = [
  { id: 'genel', label: 'Genel', count: 5 },
  { id: 'fatura', label: 'Faturalandırma', count: 4 },
  { id: 'guvenlik', label: 'Güvenlik', count: 3 },
  { id: 'entegrasyon', label: 'Entegrasyonlar', count: 3 },
  { id: 'teknik', label: 'Teknik', count: 3 },
];

type FAQ = { q: string; a: string[] };
type CatData = { id: string; label: string; items: FAQ[] };

const FAQ_DATA: CatData[] = [
  {
    id: 'genel',
    label: 'Genel Sorular',
    items: [
      { q: 'Wixi nedir ve hangi sorunu çözer?', a: ['Wixi, KOBİ\'ler için modüler bir SaaS platformudur. E-Ticaret, CRM ve İnsan Kaynakları gibi farklı operasyonel ihtiyaçları tek bir panelde birleştirir. Her müşteri kendi izole altyapısına sahiptir.', 'Geleneksel olarak ayrı ayrı yazılımlar satın almak ve entegre etmek zorunda kalan işletmeler, Wixi sayesinde tek hesap, tek arayüz, tek fatura ile çalışabilir.'] },
      { q: 'Ücretsiz deneme süresinde tüm özellikler kullanılabilir mi?', a: ['Evet. 14 gün boyunca Premium plan dahil tüm modüllere ve özelliklere sınırsız erişiminiz olur. Kredi kartı bilgisi vermeden hemen başlayabilirsiniz; deneme bitiminde otomatik bir ödeme yapılmaz.'] },
      { q: 'Modüller arasında ne zaman geçiş yapabilirim?', a: ['İstediğiniz an. Panelinizden modülleri tek tıkla açıp kapatabilir, planınızı yükseltip düşürebilirsiniz. Ücretlendirme oransal olarak yansıtılır.'] },
      { q: 'Hangi sektörlere uygun?', a: ['Wixi şu sektörlerde aktif olarak kullanılmaktadır: Perakende ve e-ticaret, Hizmet sektörü (kuaför, atölye, danışmanlık), Üretim atölyeleri, Gıda ve restoran zincirleri, Tekstil ve giyim. Her sektör için özel hazır temalar ve şablonlar mevcuttur.'] },
      { q: 'Teknik bilgim yok, kendim kurabilir miyim?', a: ['Kesinlikle. Wixi\'yi sıfır teknik bilgi gerektirmeyecek şekilde tasarladık. Onboarding sihirbazımız sizi adım adım yönlendirir; takıldığınız her yerde canlı destek ekibimiz yardımcı olur.'] },
    ],
  },
  {
    id: 'fatura',
    label: 'Faturalandırma & Ödeme',
    items: [
      { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: ['Visa, Mastercard, Troy kredi/banka kartları ile online ödeme; havale/EFT ve kurumsal müşteriler için 30 günlük ödeme vadesi seçeneklerimiz mevcut. Tüm online ödemeler İyzico ve PayTR üzerinden güvenli şekilde işlenir; 3D Secure standardındadır.'] },
      { q: 'Yıllık ödemenin avantajı nedir?', a: ['Yıllık ödemede aylık fiyatlara göre %20 indirim alırsınız. Ayrıca yıllık planlara 1 ay ücretsiz onboarding kredisi dahildir.'] },
      { q: 'İade politikanız nedir?', a: ['İlk 30 gün içinde memnun kalmazsanız, hiçbir soru sormadan tüm ödemenizi iade ederiz. İade süreci ortalama 3-5 iş günü içinde tamamlanır.'] },
      { q: 'E-fatura nasıl temin edilir?', a: ['Her ödeme sonrası e-faturanız otomatik düzenlenir ve hesabınıza tanımlı e-posta adresine GİB sistemine entegre olarak gönderilir. Geçmiş tüm e-faturalarınıza panelden erişebilirsiniz.'] },
    ],
  },
  {
    id: 'guvenlik',
    label: 'Güvenlik & Veri',
    items: [
      { q: 'Verilerim nerede saklanıyor? Güvenli mi?', a: ['Tüm veriler Türkiye\'deki KVKK uyumlu veri merkezlerinde tutulur. Her tenant için izole edilmiş alt yapı kullanırız. Standart altyapımız: ISO 27001 sertifikalı veri merkezleri, TLS 1.3 + AES-256 şifreleme, Günlük otomatik yedekleme (30 gün geri yükleme), Saldırı tespit sistemleri (IDS/IPS), 2 faktörlü kimlik doğrulama (2FA).'] },
      { q: 'KVKK uyumluluğu nasıl sağlanıyor?', a: ['Wixi, Kişisel Verilerin Korunması Kanunu (KVKK) gereksinimlerini karşılayacak şekilde tasarlanmıştır. Müşteri verileri yalnızca Türkiye sınırları içinde işlenir ve saklanır. Her tenant için ayrı VERBİS kayıt desteği sunarız.'] },
      { q: 'Verilerimin dışa aktarımı mümkün mü?', a: ['Evet. İstediğiniz an verilerinizin tamamını CSV, JSON veya SQL dump formatında indirebilirsiniz. Hesabınızı kapatmanız durumunda 90 gün boyunca verileriniz arşivde tutulur.'] },
    ],
  },
  {
    id: 'entegrasyon',
    label: 'Entegrasyonlar',
    items: [
      { q: 'Mevcut e-ticaret sitemden ürünleri taşıyabilir miyim?', a: ['Evet. Shopify, WooCommerce, Magento, Trendyol, Hepsiburada, N11, İdeasoft, T-Soft, Ticimax ve CSV/Excel ile manuel içe aktarma desteğimiz var. Premium ve Kurumsal planlarda ücretsiz taşıma desteği veriyoruz.'] },
      { q: 'Hangi kargo firmalarıyla entegrasyon var?', a: ['Aras Kargo, Yurtiçi Kargo, MNG Kargo, PTT, Sürat Kargo, UPS Türkiye ve HepsiJET ile API entegrasyonumuz mevcuttur. Tek tıkla etiket basma ve takip kodu üretme özellikleriyle kullanılır.'] },
      { q: 'REST API\'niz var mı?', a: ['Evet. Tüm modüller için açık REST API ve webhook desteği vardır. Premium plan 50.000/ay, Kurumsal plan ise sınırsız API çağrısı içerir.'] },
    ],
  },
  {
    id: 'teknik',
    label: 'Teknik Sorular',
    items: [
      { q: 'Kendi domainime bağlayabilir miyim?', a: ['Premium ve Kurumsal planlarda sınırsız özel domain bağlama desteği vardır. DNS kayıtlarını panelden tek tıkla yapılandırabilir; SSL sertifikası 24 saat içinde otomatik olarak aktif olur.'] },
      { q: 'Uptime garantiniz nedir?', a: ['Standart ve Premium planlarda %99.9 uptime hedefi; Kurumsal planda yazılı SLA ile %99.95 garantisi. Statümüzü canlı olarak status.wixi.app adresinden takip edebilirsiniz.'] },
      { q: 'Mobil uygulamanız var mı?', a: ['iOS ve Android için yönetici uygulamamız mevcuttur. Sipariş yönetimi, stok güncelleme, CRM bildirimleri ve raporlar mobilden tam yetkili olarak yönetilebilir.'] },
    ],
  },
];

export function SssPage() {
  useScrollReveal();
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const [activecat, setActivecat] = useState('genel');

  const q = query.trim().toLowerCase();
  const filtered = FAQ_DATA.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.join(' ').toLowerCase().includes(q)),
  })).filter((cat) => cat.items.length > 0);

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Sık Sorulan Sorular</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Aklınızda <span className="lp-grad-text">soru kalmasın</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Yanıt bulamadığınız bir şey varsa canlı destek ekibimiz 7/24 hazır.</p>
          <div className={`${s.searchWrap} fade-up`} data-delay="3">
            <span className={s.searchIc}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className={s.searchInput} type="search" placeholder="Sorunuzu arayın..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <span className={s.searchKbd}>⌘ K</span>
          </div>
        </div>
      </section>

      <section className={s.page}>
        <div className="lp-container">
          <div className={s.pageShell}>
            <aside className={s.sidebar}>
              <div className={s.sideLabel}>Kategoriler</div>
              {CATS.map((cat) => (
                <button key={cat.id} className={`${s.sideLink} ${activecat === cat.id && !q ? s.sideLinkOn : ''}`} onClick={() => { setActivecat(cat.id); }}>
                  <span>{cat.label}</span>
                  <span className={s.sideNum}>{cat.count}</span>
                </button>
              ))}
            </aside>

            <div className={s.content}>
              {filtered.length === 0 ? (
                <div className={s.emptyState}>
                  <div className={s.emptyIc}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                  <h4>Sonuç bulunamadı</h4>
                  <p>Aramanızla eşleşen bir soru yok. <a href="/iletisim" style={{ color: '#a5b4fc' }}>Bize sorun</a>.</p>
                </div>
              ) : filtered.map((cat) => (
                <div key={cat.id} className={s.cat} id={cat.id}>
                  <h2 className={s.catH2}>
                    <span className={s.catIc}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
                    {cat.label}
                  </h2>
                  <div className={s.faqList}>
                    {cat.items.map((item, i) => {
                      const key = `${cat.id}-${i}`;
                      const isOpen = openIdx === key;
                      return (
                        <div key={key} className={`${s.faqItem} lp-glass ${isOpen ? s.faqItemOpen : ''}`}>
                          <button className={s.faqQ} onClick={() => setOpenIdx(isOpen ? null : key)}>
                            {item.q}
                            <span className={s.faqIc}>+</span>
                          </button>
                          {isOpen && (
                            <div className={s.faqA}>
                              {item.a.map((p, pi) => <p key={pi}>{p}</p>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={s.contact}>
        <div className="lp-container">
          <div className="lp-section-head fade-up">
            <span className="lp-eyebrow"><span className="lp-dot" />Hâlâ Yardım mı Lazım?</span>
            <h2 className="lp-section-head" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 'clamp(30px,3.6vw,42px)', fontWeight: 800, margin: '14px 0 0', letterSpacing: '-.025em' }}>Size <span className="lp-grad-text">yakınız</span></h2>
          </div>
          <div className={s.contactGrid} style={{ marginTop: 32 }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Canlı Destek', desc: 'Anında yanıt için sağ alttaki chat balonuna tıklayın. Türkçe destek ekibi 7/24 hazır.', meta: '● Aktif şu an — ort. 30sn yanıt', btn: 'Chat\'i Aç', href: '#', delay: '0' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>, title: 'E-posta', desc: 'Daha detaylı sorular için. Genelde 2 saatin altında yanıt alırsınız.', meta: 'destek@wixi.app', btn: 'E-posta Gönder', href: 'mailto:destek@wixi.app', delay: '1' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-2.02a2 2 0 0 1 2.11-.45c1 .35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z"/></svg>, title: 'Telefon', desc: 'Hafta içi 09:00 — 18:00 arası. Premium üyelerimiz için 7/24 acil hat.', meta: '+90 (212) 999 00 00', btn: 'Şimdi Ara', href: 'tel:+902129990000', delay: '2' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Demo Randevusu', desc: '15 dakikalık 1:1 görüşme. Uzmanımız ihtiyacınıza özel demo yapsın.', meta: 'Müsait slotlar — bugün/yarın', btn: 'Takvimi Aç', href: '#', delay: '3' },
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
