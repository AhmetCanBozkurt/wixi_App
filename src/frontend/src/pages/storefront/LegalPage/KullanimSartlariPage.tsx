import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLegalQuery } from '../../../entities/landing';
import s from './LegalPage.module.css';

const SECTIONS = [
  { id: 'taraflar', num: '01', title: 'Taraflar ve Kapsam' },
  { id: 'hesap', num: '02', title: 'Hesap ve Erişim' },
  { id: 'kullanim-kurallari', num: '03', title: 'Kullanım Kuralları' },
  { id: 'abonelik', num: '04', title: 'Abonelik ve Ödeme' },
  { id: 'fikri-mulkiyet', num: '05', title: 'Fikri Mülkiyet' },
  { id: 'sorumluluk', num: '06', title: 'Sorumluluk Sınırı' },
  { id: 'fesih', num: '07', title: 'Fesih' },
  { id: 'genel', num: '08', title: 'Genel Hükümler' },
];

const INFO_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const SPINNER = (
  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle', marginLeft: 8 }} />
);

export function KullanimSartlariPage() {
  useScrollReveal();
  const { i18n } = useTranslation();
  const { data: doc, isLoading } = useLegalQuery('terms', i18n.language);

  const title = doc?.title ?? 'Kullanım Şartları';
  const effectiveDate = doc?.effectiveDate ?? '1 Mayıs 2026';
  const version = doc?.version ?? '4.0';

  const contentSection = doc?.contentHtml && doc.contentHtml.length > 50
    ? <div className={s.content} dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
    : (
      <div className={s.content}>
        <div className={s.callout}>
          <div className={s.calloutIc}>{INFO_ICON}</div>
          <p>Wixi hizmetlerine kaydolarak veya hizmetleri kullanarak bu Kullanım Şartları'nı kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız hizmetlerimizi kullanmayınız.</p>
        </div>

        <div className={s.section} id="taraflar">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>01</span>Taraflar ve Kapsam</h2>
          <p>Bu Kullanım Şartları ("Şartlar"), <strong>Wixi Teknoloji A.Ş.</strong> ("Wixi", "biz") ile wixi.app üzerinden sunulan hizmetleri kullanan gerçek veya tüzel kişiler ("Kullanıcı", "siz") arasında akdedilmiş bir sözleşmedir.</p>
          <h3 className={s.sectionH3}>Kapsam</h3>
          <p>Bu Şartlar; wixi.app alan adı, mobil uygulamalar, API hizmetleri ve Wixi tarafından sunulan tüm ürün ve hizmetleri kapsamaktadır.</p>
          <ul>
            <li>Hizmetleri kullanmadan önce bu Şartlar'ı okumanız zorunludur.</li>
            <li>18 yaşından küçük bireyler hizmetleri kullanamaz.</li>
            <li>Tüzel kişiler adına kaydolan kullanıcılar yetkili temsilci sıfatıyla hareket etmektedir.</li>
          </ul>
        </div>

        <div className={s.section} id="hesap">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>02</span>Hesap ve Erişim</h2>
          <h3 className={s.sectionH3}>Hesap Oluşturma</h3>
          <p>Hizmetlerimizden tam olarak yararlanabilmek için bir hesap oluşturmanız gerekmektedir. Hesap oluştururken:</p>
          <ul>
            <li>Doğru, eksiksiz ve güncel bilgi sağlamayı kabul edersiniz.</li>
            <li>Hesabınızın güvenliğini (şifre ve erişim bilgileri dahil) korumakla yükümlüsünüz.</li>
            <li>Hesabınızda gerçekleşen tüm eylemlerden siz sorumlusunuzdur.</li>
            <li>Yetkisiz erişim durumunda Wixi'yi derhal bilgilendirmelisiniz.</li>
          </ul>
          <h3 className={s.sectionH3}>Erişim Kısıtlamaları</h3>
          <p>Wixi, güvenlik ihlali, şart ihlali veya şüpheli faaliyet tespiti durumunda hesabınıza erişimi askıya alma veya sonlandırma hakkını saklı tutar.</p>
        </div>

        <div className={s.section} id="kullanim-kurallari">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>03</span>Kullanım Kuralları</h2>
          <p>Hizmetleri kullanırken aşağıdaki eylemleri gerçekleştirmemeyi kabul edersiniz:</p>
          <h3 className={s.sectionH3}>Yasak Faaliyetler</h3>
          <ul>
            <li>Yasa dışı, zararlı, tehdit edici, taciz edici veya yanıltıcı içerik yayımlamak</li>
            <li>Başkalarının fikri mülkiyet haklarını ihlal etmek</li>
            <li>Kötü amaçlı yazılım, virüs veya zararlı kod yaymak</li>
            <li>Hizmetlerin altyapısına yetkisiz erişim sağlamaya çalışmak</li>
            <li>Hizmetleri aşırı yükleyecek veya kesintiye uğratacak faaliyetlerde bulunmak</li>
            <li>Otomatik araçlarla yetkisiz veri toplamak (scraping)</li>
            <li>Başka kullanıcıların deneyimini olumsuz etkileyecek eylemler gerçekleştirmek</li>
          </ul>
          <h3 className={s.sectionH3}>İçerik Sorumluluğu</h3>
          <p>Hizmetler aracılığıyla yüklediğiniz, paylaştığınız veya sunduğunuz tüm içeriklerden yalnızca siz sorumlusunuz. Wixi, kullanıcı içeriklerini izleme yükümlülüğü taşımamakla birlikte şart ihlali tespit etmesi halinde içerikleri kaldırma hakkını saklı tutar.</p>
        </div>

        <div className={s.section} id="abonelik">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>04</span>Abonelik ve Ödeme</h2>
          <h3 className={s.sectionH3}>Planlar ve Ücretlendirme</h3>
          <p>Wixi, aylık veya yıllık olarak faturalandırılan çeşitli abonelik planları sunmaktadır. Seçilen plana göre belirlenen ücret, abonelik başlangıcında tahsil edilir.</p>
          <ul>
            <li><strong>Otomatik yenileme:</strong> Abonelikler siz iptal etmediğiniz sürece otomatik olarak yenilenir.</li>
            <li><strong>Fiyat değişiklikleri:</strong> Fiyat değişiklikleri en az 30 gün önceden bildirilir.</li>
            <li><strong>İptal:</strong> Aboneliğinizi istediğiniz zaman iptal edebilirsiniz; mevcut dönem sonunda erişiminiz sona erer.</li>
            <li><strong>İade politikası:</strong> Yıllık planlar için ilk 14 gün içinde tam iade yapılır. Aylık planlar için iade yapılmaz.</li>
          </ul>
          <h3 className={s.sectionH3}>Ödeme Yöntemleri</h3>
          <p>Kredi kartı ve banka kartı ile ödeme kabul edilmektedir. Tüm işlemler güvenli ödeme altyapısı üzerinden gerçekleştirilir; kart bilgileri Wixi sistemlerinde saklanmaz.</p>
          <div className={s.callout}>
            <div className={s.calloutIc}>{INFO_ICON}</div>
            <p>Ödeme başarısızlığı durumunda 3 iş günü içinde ödemenin tamamlanması beklenir; aksi hâlde hesap askıya alınabilir.</p>
          </div>
        </div>

        <div className={s.section} id="fikri-mulkiyet">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>05</span>Fikri Mülkiyet</h2>
          <h3 className={s.sectionH3}>Wixi'ye Ait Haklar</h3>
          <p>Wixi platformu, yazılımı, tasarımı, logoları, ticari markaları ve tüm içerikleri Wixi Teknoloji A.Ş.'ye aittir veya lisanslıdır. Bu Şartlar kapsamında size tanınan lisans yalnızca hizmetleri kullanmaya yönelik sınırlı, devredilemez ve münhasır olmayan bir lisanstır.</p>
          <h3 className={s.sectionH3}>Kullanıcı İçerikleri</h3>
          <p>Hizmetler aracılığıyla yüklediğiniz içerikler üzerindeki tüm haklar size aittir. Wixi'ye yalnızca hizmetlerin sunulması amacıyla bu içerikleri kullanmak için sınırlı bir lisans tanımış olursunuz.</p>
          <h3 className={s.sectionH3}>Geri Bildirimler</h3>
          <p>Wixi'ye ilettiğiniz öneri, geri bildirim veya fikir gibi materyaller üzerinde Wixi, herhangi bir yükümlülük doğmaksızın serbestçe kullanım hakkına sahiptir.</p>
        </div>

        <div className={s.section} id="sorumluluk">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>06</span>Sorumluluk Sınırı</h2>
          <h3 className={s.sectionH3}>Hizmet Garantisi</h3>
          <p>Wixi, hizmetlerin kesintisiz veya hatasız çalışacağını garanti etmez. Hizmetler "olduğu gibi" sunulmaktadır.</p>
          <h3 className={s.sectionH3}>Sorumluluk Reddi</h3>
          <p>Yürürlükteki mevzuatın izin verdiği azami ölçüde, Wixi'nin herhangi bir dönemde size karşı toplam sorumluluğu, zararın oluştuğu aydan önceki 12 aylık dönemde ödediğiniz toplam ücretle sınırlıdır.</p>
          <ul>
            <li>Dolaylı, tesadüfi, özel veya cezai zararlardan sorumlu değiliz.</li>
            <li>Kâr kaybı, veri kaybı veya iş kesintisinden doğan zararlardan sorumlu değiliz.</li>
            <li>Üçüncü taraf hizmetlerden kaynaklanan zararlardan sorumlu değiliz.</li>
          </ul>
        </div>

        <div className={s.section} id="fesih">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>07</span>Fesih</h2>
          <h3 className={s.sectionH3}>Kullanıcı Tarafından Fesih</h3>
          <p>Hesabınızı istediğiniz zaman Hesap Ayarları &gt; Hesabı Kapat bölümünden kapatabilirsiniz. Hesap kapatma talebi alındıktan sonra verileriniz KVKK'daki saklama sürelerine uygun olarak işlenir.</p>
          <h3 className={s.sectionH3}>Wixi Tarafından Fesih</h3>
          <p>Wixi, aşağıdaki durumlarda hesabınızı derhal feshedebilir:</p>
          <ul>
            <li>Bu Şartlar'ın ihlali</li>
            <li>Yasa dışı faaliyet tespiti</li>
            <li>Uzun süreli ödeme başarısızlığı</li>
            <li>Diğer kullanıcılara veya platforma zarar veren davranışlar</li>
          </ul>
          <p>Fesih durumunda verilerinizi 30 gün içinde dışa aktarma hakkınız saklıdır.</p>
        </div>

        <div className={s.section} id="genel">
          <h2 className={s.sectionH2}><span className={s.sectionNum}>08</span>Genel Hükümler</h2>
          <h3 className={s.sectionH3}>Uygulanacak Hukuk</h3>
          <p>Bu Şartlar, Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</p>
          <h3 className={s.sectionH3}>Değişiklikler</h3>
          <p>Wixi bu Şartlar'ı herhangi bir zamanda güncelleme hakkını saklı tutar. Önemli değişiklikler e-posta veya platform bildirimi aracılığıyla en az 30 gün önceden duyurulur. Değişiklikler yürürlüğe girdikten sonra hizmetleri kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.</p>
          <h3 className={s.sectionH3}>Bölünebilirlik</h3>
          <p>Bu Şartlar'ın herhangi bir hükmünün geçersiz veya uygulanamaz olduğu tespit edilirse, ilgili hüküm azami geçerli ölçüde uygulanır; kalan hükümler yürürlükte kalmaya devam eder.</p>
          <h3 className={s.sectionH3}>İletişim</h3>
          <p>Bu Şartlar hakkındaki sorularınız için: <a href="mailto:legal@wixi.app">legal@wixi.app</a></p>
          <div className={s.callout}>
            <div className={s.calloutIc}>{INFO_ICON}</div>
            <p>Bu Şartlar'ın Türkçe metni geçerli olmakla birlikte, anlaşılabilirlik amacıyla başka dillerde çeviri sunulabilir. Çelişki durumunda Türkçe metin esas alınır.</p>
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
            {isLoading ? <>Kullanım Şartları {SPINNER}</> : title}
          </h1>
          <p className={`${s.heroP} fade-up`} data-delay="2">Wixi hizmetlerini kullanmadan önce lütfen bu şartları dikkatlice okuyun.</p>
          <div className={`${s.meta} fade-up`} data-delay="3">
            <span><b>Son güncelleme:</b> {effectiveDate}</span>
            <span><b>Yürürlük tarihi:</b> {effectiveDate}</span>
            <span><b>Versiyon:</b> {version}</span>
          </div>
          <div className={`${s.tabs} fade-up`} data-delay="4">
            <Link to="/gizlilik" className={s.tabLink}>Gizlilik</Link>
            <Link to="/kvkk" className={s.tabLink}>KVKK</Link>
            <span className={`${s.tabLink} ${s.tabLinkOn}`}>Kullanım Şartları</span>
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
