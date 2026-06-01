import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './CheckoutSuccessPage.module.css';

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number;
    left: string;
    background: string;
    delay: string;
    duration: string;
    rotate: string;
    width: string;
    height: string;
  }>>([]);

  const tenant = searchParams.get('tenant') || sessionStorage.getItem('wixi-checkout-slug') || 'store';
  const paid = searchParams.get('paid') === 'true' || searchParams.get('session_id') !== null;
  const storeName = sessionStorage.getItem('wixi-signup-store-name') || 'Mağaza Sahibi';
  const email = sessionStorage.getItem('wixi-signup-email') || '';
  const planCode = sessionStorage.getItem('wixi-checkout-plan-code') || 'pro';

  // Confetti trigger
  useEffect(() => {
    const colors = ['#6366f1', '#8b5cf6', '#c4b5fd', '#10b981', '#fbbf24', '#ec4899'];
    const tempPieces = [];
    for (let i = 0; i < 60; i++) {
      tempPieces.push({
        id: i,
        left: Math.random() * 100 + '%',
        background: colors[i % colors.length],
        delay: (Math.random() * 1.5) + 's',
        duration: (3 + Math.random() * 2.5) + 's',
        rotate: `rotate(${Math.random() * 360}deg)`,
        width: (4 + Math.random() * 6) + 'px',
        height: (8 + Math.random() * 10) + 'px',
      });
    }
    setConfettiPieces(tempPieces);

    // Clean up confetti after 6 seconds to save DOM nodes
    const timer = setTimeout(() => {
      setConfettiPieces([]);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const getTrialExpiryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getFirstChargeText = () => {
    if (planCode === 'starter') return '₺358,80'; // 299 + 20% KDV
    if (planCode === 'pro') return '₺958,80'; // 799 + 20% KDV
    return '₺0';
  };

  const getPlanName = () => {
    if (planCode === 'starter') return 'Standart';
    if (planCode === 'pro') return 'Premium';
    return 'Trial';
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background Orbs */}
      <div className={styles.orbs} aria-hidden={true}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
      </div>

      {/* Confetti container */}
      <div className={styles.confetti}>
        {confettiPieces.map((p) => (
          <span
            key={p.id}
            style={{
              left: p.left,
              background: p.background,
              animationDelay: p.delay,
              animationDuration: p.duration,
              transform: p.rotate,
              width: p.width,
              height: p.height,
            }}
          />
        ))}
      </div>

      <header className={styles.coTop}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span className={styles.brandName}>WIXI<span className={styles.dim}>APP</span></span>
        </Link>
        <div className={styles.coStepper}>
          <div className={`${styles.step} ${styles.stepDone}`}><span className={styles.n}><span>1</span></span><b>Plan</b></div>
          <div className={styles.sep} style={{ background: 'var(--color-success)' }}></div>
          <div className={`${styles.step} ${styles.stepDone}`}><span className={styles.n}><span>2</span></span><b>Ödeme</b></div>
          <div className={styles.sep} style={{ background: 'var(--color-success)' }}></div>
          <div className={`${styles.step} ${styles.stepCur}`}><span className={styles.n}><span>3</span></span><b>Onay</b></div>
        </div>
        <span className={styles.orderNumText}>SİP #W-A8421</span>
      </header>

      <section className={styles.coSuccess}>
        <div className={styles.checkBurst}>
          <span className={styles.ring}></span>
          <span className={styles.ring}></span>
          <span className={styles.ring}></span>
          <div className={styles.markCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </div>

        <h1>Hoş geldiniz, <span className={styles.gradText}>{storeName}!</span></h1>
        <p>
          Aboneliğiniz başarıyla aktifleştirildi. 14 günlük ücretsiz deneme süreniz başladı.
          {email && (
            <>
              <br />Faturanız <b style={{ color: 'var(--text-main)' }}>{email}</b> adresine gönderildi.
            </>
          )}
        </p>

        <div className={styles.btns}>
          <Link to={`/tenant/${tenant}`} className={styles.btnPrimaryLg}>Panele Git →</Link>
          <a href="#" className={styles.btnGhostLg}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Faturayı İndir
          </a>
        </div>

        <div className={`${styles.coSuccessDetails} ${styles.glass}`}>
          <div className={styles.detailCol}>
            <b>Sipariş No</b>
            <span>#W-A8421</span>
          </div>
          <div className={styles.detailCol}>
            <b>Plan</b>
            <span>{getPlanName()}</span>
          </div>
          <div className={styles.detailCol}>
            <b>Deneme Bitiş</b>
            <span>{getTrialExpiryDate()}</span>
          </div>
          <div className={styles.detailCol}>
            <b>İlk Ödeme</b>
            <span>{paid ? getFirstChargeText() : '₺0'}</span>
          </div>
        </div>

        <div className={styles.cardsBlockContainer}>
          <div className={`${styles.cardBlock} ${styles.glass}`}>
            <div className={styles.cardBlockIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/></svg>
            </div>
            <h2>İlk ürününüzü ekleyin</h2>
            <p>Sadece 30 saniye sürer.</p>
          </div>
          <div className={`${styles.cardBlock} ${styles.glass}`}>
            <div className={styles.cardBlockIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            </div>
            <h2>Mağaza temanızı seçin</h2>
            <p>30+ hazır şablon.</p>
          </div>
          <div className={`${styles.cardBlock} ${styles.glass}`}>
            <div className={styles.cardBlockIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
            </div>
            <h2>Ekibinizi davet edin</h2>
            <p>15 kullanıcıya kadar.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default CheckoutSuccessPage;
