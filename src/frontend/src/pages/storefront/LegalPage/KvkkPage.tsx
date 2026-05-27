import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLegalQuery } from '../../../entities/landing';
import s from './LegalPage.module.css';

const SECTIONS = [
  { id: 'veri-sorumlusu', num: '01', title: 'Veri Sorumlusu' },
  { id: 'isleme-amaci', num: '02', title: 'İşleme Amacı' },
  { id: 'hukuki-dayanak', num: '03', title: 'Hukuki Dayanak' },
  { id: 'aktarim', num: '04', title: 'Veri Aktarımı' },
  { id: 'saklama', num: '05', title: 'Saklama Süresi' },
  { id: 'ilgili-kisi', num: '06', title: 'İlgili Kişi Hakları' },
  { id: 'basvuru', num: '07', title: 'Başvuru Yöntemi' },
];

const SPINNER = (
  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle', marginLeft: 8 }} />
);

export function KvkkPage() {
  useScrollReveal();
  const { i18n } = useTranslation();
  const { data: doc, isLoading } = useLegalQuery('kvkk', i18n.language);

  const title = doc?.title ?? 'KVKK Aydınlatma Metni';
  const effectiveDate = doc?.effectiveDate ?? '1 Mayıs 2026';

  const contentSection = doc?.contentHtml && doc.contentHtml.length > 50
    ? <div className={s.content} dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
    : (
      <div className={s.content}>
        <div className={s.section} id="veri-sorumlusu">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>01</span>Veri Sorumlusu</h2>
          <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>Wixi Teknoloji A.Ş.</strong> tarafından işlenmektedir.</p>
          <ul>
            <li><strong>Ticaret Unvanı:</strong> Wixi Teknoloji A.Ş.</li>
            <li><strong>Adres:</strong> Maslak Mah. Büyükdere Cad. No:255, 34398 Sarıyer/İstanbul</li>
            <li><strong>E-posta:</strong> kvkk@wixi.app</li>
            <li><strong>VERBİS No:</strong> 1234567890</li>
          </ul>
        </div>

        <div className={s.section} id="isleme-amaci">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>02</span>İşleme Amacı ve Kategoriler</h2>
          <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <h3 className={s.sectionH3}>Kimlik ve İletişim Verileri</h3>
          <p>Ad, soyad, e-posta, telefon: Hesap oluşturma, kimlik doğrulama, fatura ve bildirim iletimi amacıyla işlenmektedir.</p>
          <h3 className={s.sectionH3}>Finansal Veriler</h3>
          <p>Fatura adresi, vergi bilgileri: Yasal muhasebe ve faturalama yükümlülükleri için işlenmektedir. Kart bilgileri şifreli ödeme sağlayıcı üzerinden işlenir ve tarafımızca saklanmaz.</p>
          <h3 className={s.sectionH3}>İşlem Güvenliği Verileri</h3>
          <p>IP adresi, oturum bilgileri, işlem kayıtları: Güvenlik ve dolandırıcılık tespiti amacıyla işlenmektedir.</p>
          <h3 className={s.sectionH3}>Pazarlama Verileri</h3>
          <p>Kullanım alışkanlıkları ve tercihler: Yalnızca açık rızanız kapsamında, kişiselleştirilmiş içerik sunumu için işlenmektedir.</p>
        </div>

        <div className={s.section} id="hukuki-dayanak">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>03</span>Hukuki Dayanak</h2>
          <p>Kişisel verileriniz KVKK Madde 5 ve 6 kapsamında aşağıdaki hukuki dayanaklar çerçevesinde işlenmektedir:</p>
          <ul>
            <li><strong>Madde 5/2-a:</strong> Kanunlarda açıkça öngörülmesi (vergi ve ticaret mevzuatı)</li>
            <li><strong>Madde 5/2-c:</strong> Sözleşmenin kurulması veya ifası için zorunlu olması</li>
            <li><strong>Madde 5/2-ç:</strong> Hukuki yükümlülüğün yerine getirilmesi</li>
            <li><strong>Madde 5/2-f:</strong> Meşru menfaat kapsamında (güvenlik, hizmet kalitesi)</li>
            <li><strong>Madde 5/1:</strong> Açık rıza (pazarlama iletişimi)</li>
          </ul>
        </div>

        <div className={s.section} id="aktarim">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>04</span>Veri Aktarımı</h2>
          <p>Kişisel verileriniz yalnızca aşağıdaki durumlarda yurt içi veya yurt dışı üçüncü taraflara aktarılabilir:</p>
          <ul>
            <li><strong>Ödeme hizmeti sağlayıcılar:</strong> İyzico, PayTR (yurt içi)</li>
            <li><strong>Altyapı hizmetleri:</strong> Sunucu hizmetleri KVKK uyumlu yurt içi merkezlerde</li>
            <li><strong>E-posta altyapısı:</strong> Hesap bildirim ve fatura iletimi</li>
            <li><strong>Yetkili makamlar:</strong> Yasal zorunluluk halinde</li>
          </ul>
          <p>Yurt dışı aktarım söz konusu olduğunda KVKK Madde 9 kapsamındaki güvenceler sağlanmaktadır.</p>
        </div>

        <div className={s.section} id="saklama">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>05</span>Saklama Süresi</h2>
          <p>Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte silinir veya anonim hale getirilir. Yasal zorunluluklar kapsamında:</p>
          <ul>
            <li><strong>Fatura ve muhasebe kayıtları:</strong> 10 yıl (VUK gereği)</li>
            <li><strong>Hesap ve işlem verileri:</strong> Hesap kapatmadan itibaren 6 ay</li>
            <li><strong>Destek talepleri:</strong> Talebin kapatılmasından itibaren 3 yıl</li>
            <li><strong>Güvenlik logları:</strong> 2 yıl</li>
            <li><strong>Pazarlama tercihleri:</strong> Rıza geri alınana dek</li>
          </ul>
        </div>

        <div className={s.section} id="ilgili-kisi">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>06</span>İlgili Kişi Hakları</h2>
          <p>KVKK Madde 11 kapsamında sahip olduğunuz haklar:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'da öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </div>

        <div className={s.section} id="basvuru">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>07</span>Başvuru Yöntemi</h2>
          <p>Haklarınızı kullanmak için aşağıdaki kanallardan başvuruda bulunabilirsiniz:</p>
          <ul>
            <li><strong>E-posta:</strong> <a href="mailto:kvkk@wixi.app">kvkk@wixi.app</a> (güvenli e-posta ile)</li>
            <li><strong>Posta:</strong> Wixi Teknoloji A.Ş., Maslak Mah. Büyükdere Cad. No:255, 34398 Sarıyer/İstanbul (ıslak imzalı)</li>
            <li><strong>Panel üzerinden:</strong> Hesap &gt; Gizlilik &gt; Veri Talebi</li>
          </ul>
          <p>Başvurunuz en geç <strong>30 gün</strong> içinde ücretsiz olarak yanıtlanacaktır. Ancak işlemin ayrıca bir maliyet gerektirmesi hâlinde, Kurul tarafından belirlenen tarifedeki ücret alınabilir.</p>
          <div className={s.callout}>
            <div className={s.calloutIc}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
            <p>Başvurunuzda kimliğinizi doğrulayacak bilgileri (ad, soyad, e-posta) ve talebinizi açıkça belirtmeniz gerekmektedir. Kişisel Verileri Koruma Kurulu'na şikâyet hakkınız saklıdır.</p>
          </div>
        </div>
      </div>
    );

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Yasal</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">
            {isLoading ? <>KVKK Aydınlatma Metni {SPINNER}</> : title}
          </h1>
          <p className={`${s.heroP} fade-up`} data-delay="2">6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız ve veri işleme faaliyetlerimiz.</p>
          <div className={`${s.meta} fade-up`} data-delay="3">
            <span><b>Son güncelleme:</b> {effectiveDate}</span>
            <span><b>Yürürlük tarihi:</b> {effectiveDate}</span>
          </div>
          <div className={`${s.tabs} fade-up`} data-delay="4">
            <Link to="/gizlilik" className={s.tabLink}>Gizlilik</Link>
            <span className={`${s.tabLink} ${s.tabLinkOn}`}>KVKK</span>
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
            {contentSection}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
