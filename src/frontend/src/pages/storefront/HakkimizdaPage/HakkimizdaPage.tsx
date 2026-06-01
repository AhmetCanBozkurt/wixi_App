import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal, useCountUp } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useAboutQuery } from '../../../entities/landing';
import s from './HakkimizdaPage.module.css';

const GRADIENT_CLASSES = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;

export function HakkimizdaPage() {
  useScrollReveal();
  useCountUp();
  const { i18n } = useTranslation();
  const [dept, setDept] = useState('all');
  const { data, isLoading } = useAboutQuery(i18n.language);

  const departments = data
    ? ['all', ...Array.from(new Set(data.team.map((m) => m.department)))]
    : ['all'];

  const getDeptLabel = (key: string): string => {
    if (key === 'all') return 'Tümü';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const visibleTeam = data
    ? data.team.filter((m) => dept === 'all' || m.department === dept)
    : [];

  return (
    <LandingLayout>
      {/* HERO */}
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Hakkımızda</span>
          <h1 className={`${s.heroH1} fade-up`} data-delay="1">
            Türkiye'nin <span className="lp-grad-text">KOBİ'leri için</span> kurulduk.
          </h1>
          <p className={`${s.lead} fade-up`} data-delay="2">
            2022'de İstanbul'da kurulan Wixi, küçük ve orta ölçekli işletmelerin operasyonel
            ihtiyaçlarını tek bir platformda buluşturmak için var. Karmaşık değil, hızlı; pahalı
            değil, ulaşılabilir.
          </p>

          <div className={`${s.stats} lp-glass fade-up`} data-delay="3">
            {[
              { count: '1250', suffix: '+', label: 'Aktif İşletme' },
              { count: '35', suffix: '+', label: 'Modül' },
              { count: '42', suffix: '', label: 'Ekip' },
              { count: '3', prefix: '₺', suffix: 'M', decimals: '1', label: 'Yatırım' },
            ].map((s2) => (
              <div key={s2.label} className={s.statItem}>
                <div className={s.statNum}>
                  <span
                    data-count={s2.count}
                    data-suffix={s2.suffix}
                    data-prefix={s2.prefix}
                    data-decimals={s2.decimals}
                  >0</span>
                </div>
                <div className={s.statLbl}>{s2.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className={s.mission}>
        <div className="lp-container">
          <div className={s.missionGrid}>
            <div className={`${s.missionCopy} slide-in-l`}>
              <span className="lp-eyebrow"><span className="lp-dot" />Misyon</span>
              <h2 className={s.missionH2}>
                Bir işletmeyi büyütmek <span className="lp-grad-text">zor olmamalı.</span>
              </h2>
              <p>
                Türkiye'de <strong>3 milyondan fazla KOBİ</strong> var. Çoğu, dijital araçlara
                erişim, entegrasyon ve maliyet nedeniyle büyümekte zorluk yaşıyor. Onlarca farklı
                yazılımı yönetmek, her birine ayrı abone olmak, hepsini birbirine bağlamak — bu
                artık bir engel olmamalı.
              </p>
              <p>
                Wixi olarak inanıyoruz ki: <strong>her işletme, ihtiyacı kadar büyük</strong> bir
                yazılıma sahip olmalı. Ne fazla ne eksik. Sadeleşmiş, modüler, Türkçe ve gerçekten
                kullanılabilir.
              </p>
              <div className={s.sig}>
                <div className={s.sigAv}>EÖ</div>
                <div>
                  <strong>Emre Özcan</strong>
                  <span>Kurucu Ortak &amp; CEO</span>
                </div>
              </div>
            </div>

            <div className={`${s.missionViz} slide-in-r`}>
              {[
                { title: 'Hızlı kurulum', desc: '5 dakikada mağazanız hazır olur.' },
                { title: 'Türkçe odaklı', desc: 'Türk vergi, kargo ve ödeme sistemleriyle yerel.' },
                { title: 'Modüler büyüme', desc: 'Sadece kullandığınız modüllere ödeyin, dilediğiniz an ekleyin.' },
              ].map((c, i) => (
                <div key={c.title} className={`${s.mCard} ${s[`mCard${i + 1}` as keyof typeof s]}`}>
                  <strong>{c.title}</strong>
                  <span>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STORY / TIMELINE */}
      <section className={s.story}>
        <div className="lp-container">
          <div className={`${s.storyHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Hikayemiz</span>
            <h2 className={s.storyH2}>
              Bir kahve dükkanından <span className="lp-grad-text">1.250+ işletmeye</span>
            </h2>
            <p>Wixi'nin doğuşundan bugüne — önemli kilometre taşları.</p>
          </div>

          <div className={s.timeline}>
            <div className={s.tlLine} />
            {isLoading && <div>Yükleniyor...</div>}
            {data?.milestones.map((item) => (
              <article key={item.id} className={`${s.tlItem} fade-up`}>
                <div className={s.tlDot}>{item.year}</div>
                <div className={s.tlBody}>
                  <h4>{item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className={s.values}>
        <div className="lp-container">
          <div className={`${s.valHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Değerlerimiz</span>
            <h2 className={s.valH2}>Bizim için neler <span className="lp-grad-text">önemli</span></h2>
            <p>Her kararı, her özelliği bu dört prensiple süzeriz.</p>
          </div>
          <div className={s.valGrid}>
            {[
              { num: '01', title: 'Sadelik kazanır', desc: '"Karmaşık" bir özellik değildir, bir kusurdur. Her ekranı, her tıklamayı azaltmak için savaşırız.', color: 'violet' },
              { num: '02', title: 'Müşteri verisi kutsaldır', desc: 'Verileriniz sizindir. Satmayız, reklam için kullanmayız, AI eğitiminde kullanmayız. Türkiye\'de saklarız.', color: 'cyan' },
              { num: '03', title: 'Hızlı geri dönüş', desc: 'Canlı destekte ortalama yanıt süremiz 30 saniye. Premium müşterilerimizde 5 dakika. Bekletmek yok.', color: 'emerald' },
              { num: '04', title: 'KOBİ ile büyürüz', desc: 'Her ay 50+ müşteriyle birebir görüşür, ürünü onların ihtiyacına göre şekillendiririz.', color: 'amber' },
            ].map((v, i) => (
              <article key={v.num} className={`${s.valCard} ${s[v.color as keyof typeof s]} lp-glass fade-up`} data-delay={String(i)}>
                <div className={s.valNum}>{v.num}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className={s.team}>
        <div className="lp-container">
          <div className={`${s.teamHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Ekip</span>
            <h2 className={s.teamH2}>Wixi'yi <span className="lp-grad-text">yapanlar</span></h2>
            <p>42 kişilik ekibimizden bir kesit.</p>
            <div className={s.filter}>
              {departments.map((key) => (
                <button key={key} className={dept === key ? s.filterOn : ''} onClick={() => setDept(key)}>
                  {getDeptLabel(key)}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <div>Yükleniyor...</div>}

          <div className={s.teamGrid}>
            {visibleTeam.map((m, idx) => {
              const gradClass = GRADIENT_CLASSES[idx % GRADIENT_CLASSES.length];
              return (
                <article key={m.id} className={`${s.member} lp-glass fade-up`}>
                  <div className={`${s.av} ${s[gradClass as keyof typeof s]}`}>{m.initials}</div>
                  <strong>{m.fullName}</strong>
                  <span className={s.role}>{m.role}</span>
                  <span className={s.deptTag}>{m.department}</span>
                </article>
              );
            })}
            <article className={s.joinUs}>
              <span className={s.plus}>+</span>
              <strong>Sen de katıl</strong>
              <span>Açık 5 pozisyon</span>
            </article>
          </div>
        </div>
      </section>

      {/* PRESS */}
      <section className={s.press}>
        <div className="lp-container">
          <div className={s.pressLabel}>Yatırımcılarımız ve basında yer alma</div>
          <div className={s.pressGrid}>
            {['500 İstanbul', 'Earlybird', 'Webrazzi', 'Startup Watch', 'Bigchefs Ventures', 'Forbes Türkiye'].map((p) => (
              <div key={p} className={s.pressItem}><span className={s.pressDot} />{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICE */}
      <section className={s.office}>
        <div className="lp-container">
          <div className={s.officeGrid}>
            <div className={`${s.officeCopy} slide-in-l`}>
              <span className="lp-eyebrow"><span className="lp-dot" />Ofisimiz</span>
              <h2 className={s.officeH2}>İstanbul'dan <span className="lp-grad-text">Türkiye'ye</span></h2>
              <p>Şişli'deki merkez ofisimizde 42 kişilik ekibimizle çalışıyoruz. Hibrit çalışma modelimiz var — Türkiye'nin her bölgesinden ekip arkadaşımız var.</p>
              <div className={s.addr}>
                <div className={s.addrRow}><strong>Wixi Teknoloji A.Ş.</strong><span>Cumhuriyet Mah. Halaskargazi Cad. No: 38 / Şişli, İstanbul</span></div>
                <div className={s.addrRow}><strong>+90 (212) 999 00 00</strong><span>Mesai içi · Türkçe / İngilizce</span></div>
                <div className={s.addrRow}><strong>iletisim@wixi.app</strong><span>Genel sorular için</span></div>
              </div>
            </div>
            <div className={`${s.map} slide-in-r`}>
              <div className={s.mapPin}>
                <div className={s.mapPulse} />
                <div className={s.mapDot}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div className={s.mapLabel}>Wixi HQ · Şişli</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Sizinle <span className="lp-grad-text">çalışmak isteriz</span></h2>
            <p>Müşteri ya da ekip arkadaşı olarak — Wixi'de yeriniz var.</p>
            <div className={s.ctaBtns}>
              <a href="/login" className="lp-btn lp-btn--primary lp-btn--lg">Ücretsiz Deneyin →</a>
              <a href="#" className="lp-btn lp-btn--ghost lp-btn--lg">Açık Pozisyonları Gör</a>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
