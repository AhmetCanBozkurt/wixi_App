import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { Link } from 'react-router-dom';
import s from './LegalPage.module.css';

const SECTIONS = [
  { id: 'cerez-nedir', num: '01', title: 'Çerez Nedir?' },
  { id: 'kullanilan-cerezler', num: '02', title: 'Kullanılan Çerezler' },
  { id: 'ucuncu-taraf', num: '03', title: 'Üçüncü Taraf Çerezleri' },
  { id: 'yonetim', num: '04', title: 'Çerez Yönetimi' },
  { id: 'iletisim', num: '05', title: 'İletişim' },
];

const INFO_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

type CookieRow = { name: string; purpose: string; duration: string; type: string };

const COOKIE_TABLE: { category: string; desc: string; rows: CookieRow[] }[] = [
  {
    category: 'Zorunlu Çerezler',
    desc: 'Platformun temel işlevleri için gereklidir. Bu çerezler devre dışı bırakılamaz.',
    rows: [
      { name: 'wixi_session', purpose: 'Oturum yönetimi ve kimlik doğrulama', duration: 'Oturum süresi', type: 'Zorunlu' },
      { name: 'wixi_csrf', purpose: 'CSRF saldırılarına karşı güvenlik token\'ı', duration: 'Oturum süresi', type: 'Zorunlu' },
      { name: 'wixi_lng', purpose: 'Dil ve bölgesel tercih', duration: '1 yıl', type: 'Zorunlu' },
      { name: 'wixi_consent', purpose: 'Çerez tercih kaydı', duration: '1 yıl', type: 'Zorunlu' },
    ],
  },
  {
    category: 'Analitik Çerezler',
    desc: 'Platform kullanımını anlamamıza ve iyileştirmemize yardımcı olur. Onayınızla etkinleştirilir.',
    rows: [
      { name: '_ga', purpose: 'Ziyaretçi oturumu ayırt etme (Google Analytics)', duration: '2 yıl', type: 'Analitik' },
      { name: '_ga_*', purpose: 'Kampanya verisi (Google Analytics 4)', duration: '2 yıl', type: 'Analitik' },
      { name: 'wixi_perf', purpose: 'Sayfa yükleme süresi ve hata izleme', duration: '30 gün', type: 'Analitik' },
    ],
  },
  {
    category: 'Pazarlama Çerezleri',
    desc: 'Kişiselleştirilmiş içerik ve reklamlar için kullanılır. Onayınızla etkinleştirilir.',
    rows: [
      { name: '_fbp', purpose: 'Facebook Pixel — dönüşüm takibi', duration: '3 ay', type: 'Pazarlama' },
      { name: 'hubspotutk', purpose: 'HubSpot — form gönderimi ve CRM entegrasyonu', duration: '13 ay', type: 'Pazarlama' },
      { name: '__hstc', purpose: 'HubSpot — site etkileşim geçmişi', duration: '13 ay', type: 'Pazarlama' },
    ],
  },
];

export function CerezlerPage() {
  useScrollReveal();
  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Yasal</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Çerez Politikası</h1>
          <p className={`${s.heroP} fade-up`} data-delay="2">Wixi'nin çerezleri nasıl kullandığını ve tercihlerinizi nasıl yönetebileceğinizi açıklıyoruz.</p>
          <div className={`${s.meta} fade-up`} data-delay="3">
            <span><b>Son güncelleme:</b> 1 Mayıs 2026</span>
            <span><b>Yürürlük tarihi:</b> 1 Mayıs 2026</span>
          </div>
          <div className={`${s.tabs} fade-up`} data-delay="4">
            <Link to="/gizlilik" className={s.tabLink}>Gizlilik</Link>
            <Link to="/kvkk" className={s.tabLink}>KVKK</Link>
            <Link to="/kullanim-sartlari" className={s.tabLink}>Kullanım Şartları</Link>
            <span className={`${s.tabLink} ${s.tabLinkOn}`}>Çerezler</span>
          </div>
        </div>
      </section>

      <section className={s.body}>
        <div className="lp-container">
          <div className={s.bodyShell}>
            <aside className={s.toc}>
              <div className={s.tocTitle}>İçindekiler</div>
              {SECTIONS.map((sec) => (
                <a key={sec.id} href={`#${sec.id}`} className={s.tocLink}>{sec.num} {sec.title}</a>
              ))}
            </aside>

            <div className={s.content}>
              <div className={s.callout}>
                <div className={s.calloutIc}>{INFO_ICON}</div>
                <p>Bu Çerez Politikası, 6698 sayılı KVKK ve ilgili mevzuat kapsamında hazırlanmıştır. Sitemizi kullanmaya devam ederek zorunlu çerezlerin kullanımını kabul etmiş sayılırsınız.</p>
              </div>

              <div className={s.section} id="cerez-nedir">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>01</span>Çerez Nedir?</h2>
                <p>Çerezler, ziyaret ettiğiniz web sitesi tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Siteyi her ziyaret ettiğinizde bu dosyalar tarayıcınız tarafından siteye iletilir.</p>
                <p>Çerezler çeşitli amaçlarla kullanılır:</p>
                <ul>
                  <li><strong>Oturum yönetimi:</strong> Giriş durumunuzu ve tercihlerinizi hatırlama</li>
                  <li><strong>Güvenlik:</strong> Kimlik doğrulama ve kötüye kullanımı önleme</li>
                  <li><strong>Analitik:</strong> Site kullanımını anlama ve geliştirme</li>
                  <li><strong>Kişiselleştirme:</strong> İçerik ve reklamları tercihlerinize göre uyarlama</li>
                </ul>
                <h3 className={s.sectionH3}>Çerez Türleri</h3>
                <ul>
                  <li><strong>Oturum çerezleri:</strong> Tarayıcı kapandığında silinir.</li>
                  <li><strong>Kalıcı çerezler:</strong> Belirlenen süre boyunca cihazınızda saklanır.</li>
                  <li><strong>Birinci taraf çerezler:</strong> Wixi tarafından doğrudan yerleştirilir.</li>
                  <li><strong>Üçüncü taraf çerezler:</strong> Entegre hizmet sağlayıcılar tarafından yerleştirilir.</li>
                </ul>
              </div>

              <div className={s.section} id="kullanilan-cerezler">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>02</span>Kullanılan Çerezler</h2>
                <p>Wixi platformunda kullanılan çerezler aşağıda kategorilere göre listelenmiştir:</p>

                {COOKIE_TABLE.map((cat) => (
                  <div key={cat.category} style={{ marginBottom: '28px' }}>
                    <h3 className={s.sectionH3}>{cat.category}</h3>
                    <p>{cat.desc}</p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--lp-border)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--lp-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>Çerez Adı</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--lp-text)', fontWeight: 700 }}>Amaç</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--lp-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>Süre</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--lp-text)', fontWeight: 700 }}>Tür</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.rows.map((row) => (
                            <tr key={row.name} style={{ borderBottom: '1px solid var(--lp-border)' }}>
                              <td style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#c4b5fd' }}>{row.name}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--lp-text-muted)' }}>{row.purpose}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--lp-text-muted)', whiteSpace: 'nowrap' }}>{row.duration}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--lp-text-muted)' }}>{row.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              <div className={s.section} id="ucuncu-taraf">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>03</span>Üçüncü Taraf Çerezleri</h2>
                <p>Wixi bazı üçüncü taraf hizmetleri entegre etmektedir. Bu hizmetler kendi çerez politikaları kapsamında çerez yerleştirebilir:</p>
                <ul>
                  <li><strong>Google Analytics:</strong> Site trafiği analizi — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Gizlilik Politikası</a></li>
                  <li><strong>Facebook Pixel:</strong> Reklam dönüşüm takibi — <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer">Meta Gizlilik Politikası</a></li>
                  <li><strong>HubSpot:</strong> CRM ve form entegrasyonu — <a href="https://legal.hubspot.com/privacy-policy" target="_blank" rel="noopener noreferrer">HubSpot Gizlilik Politikası</a></li>
                  <li><strong>İyzico / PayTR:</strong> Ödeme sayfası çerezleri — ilgili sağlayıcının politikası geçerlidir</li>
                </ul>
                <div className={s.callout}>
                  <div className={s.calloutIc}>{INFO_ICON}</div>
                  <p>Üçüncü taraf çerezleri yalnızca analitik ve pazarlama tercihlerinizi kabul etmeniz halinde etkinleştirilir. Zorunlu çerezler bu kapsamın dışındadır.</p>
                </div>
              </div>

              <div className={s.section} id="yonetim">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>04</span>Çerez Yönetimi</h2>
                <h3 className={s.sectionH3}>Tercih Paneli</h3>
                <p>Sitemizin alt kısmındaki "Çerez Tercihleri" bağlantısını tıklayarak analitik ve pazarlama çerezlerini istediğiniz zaman etkinleştirebilir veya devre dışı bırakabilirsiniz. Zorunlu çerezler devre dışı bırakılamaz.</p>
                <h3 className={s.sectionH3}>Tarayıcı Ayarları</h3>
                <p>Tarayıcınızın ayarlarından tüm çerezleri engelleyebilir veya silebilirsiniz. Ancak bu durum platformun bazı işlevlerinin düzgün çalışmamasına yol açabilir:</p>
                <ul>
                  <li><strong>Chrome:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler</li>
                  <li><strong>Firefox:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</li>
                  <li><strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezleri Yönet</li>
                  <li><strong>Edge:</strong> Ayarlar &gt; Çerezler ve Site İzinleri</li>
                </ul>
                <h3 className={s.sectionH3}>Opt-Out Araçları</h3>
                <ul>
                  <li>Google Analytics Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a></li>
                  <li>Dijital Reklamcılık Tercih Merkezi: <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">youronlinechoices.com</a></li>
                </ul>
              </div>

              <div className={s.section} id="iletisim">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>05</span>İletişim</h2>
                <p>Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
                <ul>
                  <li><strong>E-posta:</strong> <a href="mailto:gizlilik@wixi.app">gizlilik@wixi.app</a></li>
                  <li><strong>Adres:</strong> Wixi Teknoloji A.Ş., Maslak Mah. Büyükdere Cad. No:255, 34398 Sarıyer/İstanbul</li>
                  <li><strong>Panel üzerinden:</strong> Hesap &gt; Gizlilik &gt; Çerez Tercihleri</li>
                </ul>
                <div className={s.callout}>
                  <div className={s.calloutIc}>{INFO_ICON}</div>
                  <p>Bu politika güncellenebildiği için zaman zaman kontrol etmenizi öneririz. Önemli değişiklikler platform bildirimi veya e-posta aracılığıyla duyurulur.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
