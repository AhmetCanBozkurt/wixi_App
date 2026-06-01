import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingLayout } from '../../../widgets/LandingLayout/LandingLayout';
import { useScrollReveal } from '../../../widgets/LandingLayout/useLandingAnimations';
import { useSubmitContactMutation } from '../../../entities/landing';
import s from './IletisimPage.module.css';

export function IletisimPage() {
  useScrollReveal();
  const { t } = useTranslation('landing');
  const [topic, setTopic] = useState('Genel');
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mutation = useSubmitContactMutation();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    mutation.mutate(
      {
        fullName: nameRef.current?.value ?? '',
        email: emailRef.current?.value ?? '',
        phone: phoneRef.current?.value || undefined,
        topic,
        message: msgRef.current?.value ?? '',
      },
      {
        onSuccess: () => {
          setSent(true);
        },
        onError: () => {
          setErrorMsg(t('LANDING_CONTACT_SUBMIT_ERROR'));
        },
      },
    );
  };

  const isPending = mutation.isPending;

  return (
    <LandingLayout>
      <section className={s.hero}>
        <div className="lp-container">
          <span className="lp-eyebrow fade-up"><span className="lp-dot" />İletişim</span>
          <h1 className={`${s.h1} fade-up`} data-delay="1">Size <span className="lp-grad-text">ulaşmak kolay</span></h1>
          <p className={`${s.lead} fade-up`} data-delay="2">Soru, demo talebi, kurumsal teklif veya basit bir merhaba — hangi kanal işinize geliyorsa.</p>
        </div>
      </section>

      <section className={s.channels}>
        <div className="lp-container">
          <div className={s.chGrid}>
            {[
              { title: 'Canlı Destek', desc: 'Anında yanıt. Sağ alttaki chat\'ten ulaşın.', meta: 'Şu an aktif · ort. 30sn', live: true },
              { title: 'E-posta', desc: 'Detaylı sorular için. 2 saat içinde yanıt.', meta: 'destek@wixi.app', live: false },
              { title: 'Telefon', desc: 'Hafta içi 09:00 — 18:00 / Türkçe destek.', meta: '+90 (212) 999 00 00', live: false },
              { title: 'Demo Randevusu', desc: '15 dk 1:1 görüşme. Uzmanımız size özel demo yapsın.', meta: 'Bugün / yarın slotlar açık', live: false },
            ].map((ch, i) => (
              <article key={ch.title} className={`${s.ch} lp-glass fade-up`} data-delay={String(i)}>
                <div className={s.chIc}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />}
                    {i === 1 && <><path d="M4 4h16v16H4z" /><path d="M22 6 12 13 2 6" /></>}
                    {i === 2 && <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-2.02a2 2 0 0 1 2.11-.45c1 .35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z" />}
                    {i === 3 && <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                  </svg>
                </div>
                <h3>{ch.title}</h3>
                <p>{ch.desc}</p>
                {ch.live
                  ? <span className={s.live}>Şu an aktif · ort. 30sn</span>
                  : <span className={s.meta}>{ch.meta}</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.main}>
        <div className={`lp-container ${s.mainGrid}`}>
          <form className={`${s.form} lp-glass slide-in-l`} onSubmit={handleSubmit} noValidate>
            <h2>Bize yazın</h2>
            <p>Ekibimiz 2 saat içinde size dönüş yapacak.</p>

            <div className={s.field}>
              <label>Konu</label>
              <div className={s.topic}>
                {['Genel', 'Satış', 'Destek', 'Basın'].map((topicOption) => (
                  <button
                    key={topicOption}
                    type="button"
                    className={topic === topicOption ? s.topicOn : ''}
                    onClick={() => setTopic(topicOption)}
                  >
                    {topicOption}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="cName">Ad Soyad</label>
                <input ref={nameRef} id="cName" type="text" placeholder="Ahmet Yılmaz" required />
              </div>
              <div className={s.field}>
                <label htmlFor="cEmail">E-posta</label>
                <input ref={emailRef} id="cEmail" type="email" placeholder="ad@isletme.com" required />
              </div>
            </div>
            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="cPhone">Telefon</label>
                <input ref={phoneRef} id="cPhone" type="tel" placeholder="+90 500 000 00 00" />
              </div>
              <div className={s.field}>
                <label htmlFor="cCompany">Şirket</label>
                <input id="cCompany" type="text" placeholder="ABC Tekstil" />
              </div>
            </div>

            <div className={s.field}>
              <label htmlFor="cMsg">Mesajınız</label>
              <textarea ref={msgRef} id="cMsg" placeholder="Nasıl yardımcı olabiliriz?" required />
            </div>

            {sent && (
              <p style={{ color: '#4ade80', fontSize: '0.9rem', margin: '8px 0' }}>
                {t('LANDING_CONTACT_SUBMIT_SUCCESS')}
              </p>
            )}
            {errorMsg && (
              <p style={{ color: '#f87171', fontSize: '0.9rem', margin: '8px 0' }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className={`lp-btn lp-btn--primary ${s.sendBtn}`}
              disabled={isPending || sent}
            >
              {sent ? '✓ Mesajınız iletildi' : isPending ? 'Gönderiliyor...' : 'Mesajı Gönder →'}
            </button>
          </form>

          <aside className={`${s.side} slide-in-r`}>
            <div className={`${s.sideCard} lp-glass`}>
              <h3>Ofisimiz</h3>
              <div className={s.sideRow}><strong>Wixi Teknoloji A.Ş.</strong><span>Cumhuriyet Mah. Halaskargazi Cad. No: 38 / Şişli, İstanbul</span></div>
              <div className={s.sideRow}><strong>Mesai saatleri</strong><span>Hafta içi 09:00 — 18:00</span></div>
              <div className={s.sideRow}><strong>Vergi &amp; MERSİS</strong><span>VKN: 1234567890</span></div>
              <div className={s.cMap}>
                <div className={s.cMapPin}>
                  <div className={s.cMapPulse} />
                  <div className={s.cMapDot}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className={s.hours}>
              <span className={s.hoursPulse} />
              <span><strong>Şu an açığız</strong> — Ekip canlı destek için hazır</span>
            </div>
          </aside>
        </div>
      </section>
    </LandingLayout>
  );
}
