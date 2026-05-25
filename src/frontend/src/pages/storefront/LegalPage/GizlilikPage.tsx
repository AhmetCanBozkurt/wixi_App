import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { Link } from 'react-router-dom';
import s from './LegalPage.module.css';

const SECTIONS = [
  { id: 'kapsam', num: '01', title: 'Kapsam ve Tanımlar' },
  { id: 'toplama', num: '02', title: 'Toplanan Veriler' },
  { id: 'kullanim', num: '03', title: 'Verilerin Kullanımı' },
  { id: 'paylasim', num: '04', title: 'Veri Paylaşımı' },
  { id: 'guvenlık', num: '05', title: 'Güvenlik' },
  { id: 'haklarınız', num: '06', title: 'Haklarınız' },
  { id: 'iletisim', num: '07', title: 'İletişim' },
];

const INFO_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export function GizlilikPage() {
  useScrollReveal();
  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Yasal</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Gizlilik Politikası</h1>
          <p className={`${s.heroP} fade-up`} data-delay="2">Kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktayız.</p>
          <div className={`${s.meta} fade-up`} data-delay="3">
            <span><b>Son güncelleme:</b> 1 Mayıs 2026</span>
            <span><b>Yürürlük tarihi:</b> 1 Mayıs 2026</span>
            <span><b>Versiyon:</b> 3.2</span>
          </div>
          <div className={`${s.tabs} fade-up`} data-delay="4">
            <span className={`${s.tabLink} ${s.tabLinkOn}`}>Gizlilik</span>
            <Link to="/kvkk" className={s.tabLink}>KVKK</Link>
            <Link to="/kullanim-sartlari" className={s.tabLink}>Kullanım Şartları</Link>
            <Link to="/cerezler" className={s.tabLink}>Çerezler</Link>
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
                <p>Bu politika, Wixi Teknoloji A.Ş. tarafından sunulan hizmetlerin kullanımı sırasında toplanan kişisel verilere ilişkin uygulamalarımızı açıklamaktadır. <strong>Tüm veriler Türkiye sınırları içinde, KVKK uyumlu merkezlerde saklanmaktadır.</strong></p>
              </div>

              <div className={s.section} id="kapsam">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>01</span>Kapsam ve Tanımlar</h2>
                <p>Bu Gizlilik Politikası; <strong>Wixi Teknoloji A.Ş.</strong> ("Wixi", "biz", "şirket") tarafından işletilen wixi.app alan adı ve ilgili hizmetler aracılığıyla toplanan kişisel veriler için geçerlidir.</p>
                <h3 className={s.sectionH3}>Tanımlar</h3>
                <ul>
                  <li><strong>Kişisel Veri:</strong> Kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi.</li>
                  <li><strong>İşleme:</strong> Kişisel veriler üzerinde gerçekleştirilen her türlü işlem.</li>
                  <li><strong>Veri Sorumlusu:</strong> Wixi Teknoloji A.Ş. — kişisel verilerin işleme amaçlarını belirleyen taraf.</li>
                  <li><strong>Kullanıcı:</strong> Wixi hizmetlerini kullanan gerçek veya tüzel kişi.</li>
                </ul>
              </div>

              <div className={s.section} id="toplama">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>02</span>Toplanan Veriler</h2>
                <h3 className={s.sectionH3}>Doğrudan Sağlanan Veriler</h3>
                <p>Hizmetlerimize kaydolurken veya hizmetleri kullanırken sizden aşağıdaki bilgileri alabiliriz:</p>
                <ul>
                  <li>Ad, soyad, e-posta adresi, telefon numarası</li>
                  <li>İşletme adı, vergi numarası, fatura adresi</li>
                  <li>Ödeme bilgileri (kart bilgileri şifreli işlenir, saklanmaz)</li>
                  <li>Profil fotoğrafı ve hesap tercihleri</li>
                </ul>
                <h3 className={s.sectionH3}>Otomatik Toplanan Veriler</h3>
                <p>Platformumuzu kullandığınızda otomatik olarak toplanabilecek teknik bilgiler:</p>
                <ul>
                  <li>IP adresi, tarayıcı türü, işletim sistemi</li>
                  <li>Sayfa görüntüleme, tıklama ve gezinme verileri</li>
                  <li>Oturum süresi ve kullanım istatistikleri</li>
                  <li>Çerez ve benzeri izleme teknolojileri aracılığıyla toplanan veriler</li>
                </ul>
              </div>

              <div className={s.section} id="kullanim">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>03</span>Verilerin Kullanımı</h2>
                <p>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanmaktayız:</p>
                <ul>
                  <li><strong>Hizmet sunumu:</strong> Hesabınızı yönetmek, siparişleri işlemek, destek sağlamak</li>
                  <li><strong>İletişim:</strong> Bildirimler, güncellemeler, faturalar göndermek</li>
                  <li><strong>Geliştirme:</strong> Platform özelliklerini iyileştirmek</li>
                  <li><strong>Güvenlik:</strong> Dolandırıcılığı önlemek, hesap güvenliğini sağlamak</li>
                  <li><strong>Yasal yükümlülükler:</strong> Mevzuat gereklilikleri</li>
                </ul>
                <div className={s.callout}>
                  <div className={s.calloutIc}>{INFO_ICON}</div>
                  <p>Kişisel verilerinizi <strong>açık rızanız olmadan</strong> doğrudan pazarlama amaçlı üçüncü taraflarla paylaşmıyoruz.</p>
                </div>
              </div>

              <div className={s.section} id="paylasim">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>04</span>Veri Paylaşımı</h2>
                <p>Verilerinizi aşağıdaki durumlarda üçüncü taraflarla paylaşabiliriz:</p>
                <ul>
                  <li><strong>Hizmet sağlayıcılar:</strong> Ödeme işlemcileri (İyzico, PayTR), kargo firmaları, e-posta altyapısı</li>
                  <li><strong>Yasal zorunluluk:</strong> Mahkeme kararı veya yetkili makam talebi</li>
                  <li><strong>Şirket işlemleri:</strong> Birleşme veya devir durumunda, aynı gizlilik koşulları altında</li>
                </ul>
                <p>Tüm üçüncü taraf hizmet sağlayıcılar KVKK ve GDPR uyumlu veri işleme sözleşmeleri kapsamında hareket etmektedir.</p>
              </div>

              <div className={s.section} id="guvenlık">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>05</span>Güvenlik</h2>
                <p>Verilerinizin güvenliği için endüstri standardı önlemler alıyoruz:</p>
                <ul>
                  <li>TLS 1.3 şifreli iletim</li>
                  <li>AES-256 ile depolama şifrelemesi</li>
                  <li>ISO 27001 sertifikalı veri merkezleri</li>
                  <li>Günlük otomatik yedekleme (30 gün geçmişe dönük)</li>
                  <li>İki faktörlü kimlik doğrulama (2FA)</li>
                  <li>Penetrasyon testleri ve güvenlik denetimleri</li>
                </ul>
              </div>

              <div className={s.section} id="haklarınız">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>06</span>Haklarınız</h2>
                <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul>
                  <li><strong>Erişim hakkı:</strong> İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                  <li><strong>Düzeltme hakkı:</strong> Yanlış veya eksik verilerin düzeltilmesini isteme</li>
                  <li><strong>Silme hakkı:</strong> Belirli koşullarda verilerinizin silinmesini talep etme</li>
                  <li><strong>İtiraz hakkı:</strong> Verilerinizin işlenmesine itiraz etme</li>
                  <li><strong>Taşınabilirlik hakkı:</strong> Verilerinizi yapılandırılmış formatta alma</li>
                </ul>
                <p>Bu haklarınızı kullanmak için <a href="mailto:kvkk@wixi.app">kvkk@wixi.app</a> adresinden bize ulaşabilirsiniz. Talepleriniz 30 gün içinde yanıtlanır.</p>
              </div>

              <div className={s.section} id="iletisim">
                <h2 className={s.sectionH2}><span className={s.sectionNum}>07</span>İletişim</h2>
                <p>Gizlilik politikamız hakkında sorularınız için:</p>
                <ul>
                  <li><strong>E-posta:</strong> <a href="mailto:gizlilik@wixi.app">gizlilik@wixi.app</a></li>
                  <li><strong>KVKK Birimi:</strong> <a href="mailto:kvkk@wixi.app">kvkk@wixi.app</a></li>
                  <li><strong>Adres:</strong> Wixi Teknoloji A.Ş., Maslak Mah. Büyükdere Cad. No:255, 34398 Sarıyer/İstanbul</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
