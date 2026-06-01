import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import s from './NasilCalisirPage.module.css';

const STEPS = [
  {
    num: '01', title: 'Kaydolun', sub: '2 dakikada hesap açın',
    desc: 'E-posta adresinizle kayıt olun, işletme bilgilerinizi girin. Kurulum yok, teknik bilgi gerekmez.',
    panel: ['Ad Soyad', 'E-posta adresi', 'İşletme adı', 'Sektör seçin'],
  },
  {
    num: '02', title: 'Modül Seçin', sub: 'İhtiyacınıza göre özelleştirin',
    desc: 'E-Ticaret, CRM, İK veya 35+ modülden ihtiyacınız olanları seçin. Sadece kullandığınız için ödeyin.',
    panel: ['E-Ticaret ₺499/ay', 'CRM ₺399/ay', 'İnsan Kaynakları ₺299/ay', 'Muhasebe ₺349/ay'],
  },
  {
    num: '03', title: 'Yayına Alın', sub: 'Dakikalar içinde canlı',
    desc: 'Mağazanızı özelleştirin, ürünlerinizi ekleyin ve tek tıkla yayına alın. Müşterileriniz artık sizi bulabilir.',
    panel: ['Canlı önizleme', 'Tema seçimi', 'Domain bağlama', '✓ Yayında'],
  },
];

const TIMELINE = [
  { step: '1', text: 'Kaydol ve planını seç' },
  { step: '2', text: 'İşletme profilini oluştur' },
  { step: '3', text: 'Modülleri etkinleştir' },
  { step: '4', text: 'Mağazanı özelleştir' },
  { step: '5', text: 'Ürün ve hizmetlerini ekle' },
  { step: '6', text: 'Ödeme altyapısını bağla' },
  { step: '7', text: 'Yayına al ve satışa başla' },
];

export function NasilCalisirPage() {
  useScrollReveal();
  const [step, setStep] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    timerRef.current = window.setInterval(() => setStep((s2) => (s2 + 1) % 3), 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i: number) => { setStep(i); clearInterval(timerRef.current); };

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />Nasıl Çalışır?</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">3 adımda <span className="lp-grad-text">hayata geçirin</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Kaydolmaktan yayına almaya kadar — ortalama 18 dakika. Gerçekten.</p>
        </div>
      </section>

      <section className={s.demo}>
        <div className="lp-container">
          <div className={s.demoGrid}>
            {/* Stepper sidebar */}
            <div className={s.stepSide}>
              {STEPS.map((st, i) => (
                <button key={st.num} className={`${s.stepBtn} ${step === i ? s.stepBtnOn : ''}`} onClick={() => goTo(i)}>
                  <span className={s.stepNum}>{st.num}</span>
                  <div className={s.stepText}>
                    <strong>{st.title}</strong>
                    <span>{st.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className={s.stepPanel}>
              <div className={`${s.panelCard} lp-glass`}>
                <div className={s.panelTop}>
                  <h2 className={s.panelH2}>{STEPS[step].title}</h2>
                  <p className={s.panelDesc}>{STEPS[step].desc}</p>
                </div>
                <div className={s.panelFields}>
                  {STEPS[step].panel.map((field) => (
                    <div key={field} className={s.panelField}>{field}</div>
                  ))}
                </div>
                <button className="lp-btn lp-btn--primary" style={{ marginTop: '20px', alignSelf: 'flex-start' }} onClick={() => goTo((step + 1) % 3)}>
                  {step < 2 ? 'Devam Et →' : 'Baştan Başla ↺'}
                </button>
              </div>
            </div>
          </div>

          {/* Step controls */}
          <div className={s.stepDots}>
            {STEPS.map((_, i) => (
              <button key={i} className={`${s.stepDot} ${step === i ? s.stepDotOn : ''}`} onClick={() => goTo(i)} aria-label={`Adım ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className={s.timeline}>
        <div className="lp-container">
          <div className={`${s.tlHead} fade-up`}>
            <span className="lp-eyebrow"><span className="lp-dot" />Kurulum Süreci</span>
            <h2 className={s.tlH2}>Yayına gitmek <span className="lp-grad-text">bu kadar basit</span></h2>
          </div>
          <div className={s.tlGrid}>
            {TIMELINE.map((item, i) => (
              <div key={item.step} className={`${s.tlItem} lp-glass fade-up`} data-delay={String(i % 4)}>
                <span className={s.tlStep}>{item.step}</span>
                <span className={s.tlText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className={s.testimonial}>
        <div className="lp-container">
          <div className={`${s.quoteCard} lp-glass fade-up`}>
            <div className={s.quoteText}>
              "Wixi'ye geçmeden önce 4 farklı yazılım kullanıyorduk. Şimdi her şey tek ekranda ve aylık maliyetimiz %60 düştü."
            </div>
            <div className={s.quoteWho}>
              <div className={s.quoteAv}>AK</div>
              <div>
                <strong>Ahmet Kaya</strong>
                <span>Kurucu, Kaya Tekstil · İstanbul</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className="lp-container">
          <div className={`${s.ctaInner} fade-up`}>
            <h2>Hazır mısınız? <span className="lp-grad-text">Başlayın.</span></h2>
            <p>14 gün ücretsiz deneyin. Kredi kartı gerekmez.</p>
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
