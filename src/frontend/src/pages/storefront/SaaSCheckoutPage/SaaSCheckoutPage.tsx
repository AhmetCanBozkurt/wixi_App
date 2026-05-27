import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useTheme } from '../../../app/providers/ThemeProvider';
import styles from './SaaSCheckoutPage.module.css';

export function SaaSCheckoutPage() {
  const [tenantId, setTenantId] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [billingInterval, setBillingInterval] = useState('Monthly');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');

  // Form Fields
  const [buyerName, setBuyerName] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('Merkez Mah. Atatürk Cad. No:1');
  const [city, setCity] = useState('İstanbul / Şişli');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'iyzico' | 'stripe'>('iyzico');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [iyzipayFormLoaded, setIyzipayFormLoaded] = useState(false);
  
  // Pricing Details (Static Fallbacks / Dynamic Map)
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Load registration context on mount
  useEffect(() => {
    const storedTenantId = sessionStorage.getItem('wixi-checkout-tenant-id');
    const storedSlug = sessionStorage.getItem('wixi-checkout-slug');
    const storedPlanCode = sessionStorage.getItem('wixi-checkout-plan-code');
    const storedInterval = sessionStorage.getItem('wixi-checkout-billing-interval') || 'Monthly';
    const storedStoreName = sessionStorage.getItem('wixi-signup-store-name') || 'Mağazam';
    const storedEmail = sessionStorage.getItem('wixi-signup-email') || '';

    if (!storedTenantId || !storedSlug || !storedPlanCode) {
      toast.error('Ödeme oturumu bulunamadı. Lütfen kayıt adımlarını tekrarlayın.');
      navigate('/register');
      return;
    }

    setTenantId(storedTenantId);
    setTenantSlug(storedSlug);
    setPlanCode(storedPlanCode);
    setBillingInterval(storedInterval);
    setStoreName(storedStoreName);
    setEmail(storedEmail);

    setBuyerName(storedStoreName);
    setCompany(storedStoreName);
  }, [navigate]);

  // Load İyzico Checkout Form script when tab is selected
  useEffect(() => {
    if (paymentMethod === 'iyzico' && tenantId && planCode && !iyzipayFormLoaded) {
      initiateIyzipay();
    }
  }, [paymentMethod, tenantId, planCode]);

  const initiateIyzipay = async () => {
    setIsLoadingPayment(true);
    setIyzipayFormLoaded(false);
    try {
      const response = await apiClient.post('/saas/payment/iyzico/initiate', {
        tenantId,
        tenantSlug,
        planCode,
        billingInterval,
      });

      const { checkoutFormContent } = response.data;
      if (checkoutFormContent) {
        // Inject and execute script
        const container = document.getElementById('iyzipay-checkout-form');
        if (container) {
          container.innerHTML = checkoutFormContent;
          const scripts = container.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            if (scripts[i].src) {
              s.src = scripts[i].src;
            } else {
              s.textContent = scripts[i].textContent;
            }
            document.body.appendChild(s);
          }
          setIyzipayFormLoaded(true);
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      const msg = err?.response?.data?.error || 'İyzico ödeme formu yüklenemedi. Lütfen sayfayı yenileyin.';
      toast.error(msg);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleStripePay = async () => {
    setIsLoadingPayment(true);
    try {
      const response = await apiClient.post('/saas/checkout', {
        tenantId,
        tenantSlug,
        planCode,
        billingInterval,
      });
      if (response.data?.sessionUrl) {
        toast.success('Stripe güvenli ödeme sayfasına yönlendiriliyorsunuz...');
        window.location.href = response.data.sessionUrl;
      } else {
        throw new Error('No session URL returned');
      }
    } catch {
      toast.error('Stripe ödemesi başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'KAMPANYA10' || code === 'WIXI10') {
      setDiscountAmount(0.1); // 10% discount
      setCouponApplied(true);
      toast.success('İndirim kuponu başarıyla uygulandı!');
    } else {
      toast.error('Geçersiz indirim kuponu.');
    }
  };

  // Pricing calculations
  const getBasePrice = () => {
    if (planCode === 'starter') {
      return billingInterval === 'Yearly' ? 2990 : 299;
    }
    if (planCode === 'pro') {
      return billingInterval === 'Yearly' ? 7990 : 799;
    }
    return 0;
  };

  const basePrice = getBasePrice();
  const discount = Math.round(basePrice * discountAmount);
  const subtotal = basePrice - discount;
  const kdv = Math.round(subtotal * 0.2); // 20% KDV
  const total = subtotal + kdv;

  return (
    <div className={styles.page}>
      <header className={styles.coTop}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span className={styles.brandName}>WIXI<span className={styles.dim}>APP</span></span>
        </Link>
        <div className={styles.coStepper}>
          <div className={`${styles.step} ${styles.stepDone}`}><span className={styles.n}><span>1</span></span><b>Plan</b></div>
          <div className={styles.sep} style={{ background: 'var(--color-success)' }}></div>
          <div className={`${styles.step} ${styles.stepCur}`}><span className={styles.n}><span>2</span></span><b>Ödeme</b></div>
          <div className={styles.sep}></div>
          <div className={styles.step}><span className={styles.n}><span>3</span></span><b>Onay</b></div>
        </div>
        <Link to="/select-plan" className={styles.btnGhostSm}>← Plan Değiştir</Link>
      </header>

      <div className={styles.coMain}>
        {/* LEFT: Billing address + payment form */}
        <div>
          {/* STEP 1: Address Details */}
          <section className={`${styles.coSection} ${styles.glass}`}>
            <h2><span className={styles.n}>1</span>Hesap & Fatura Bilgileri</h2>
            <p>Faturalandırma için işletme bilgileriniz.</p>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName">Ad Soyad</label>
                <input 
                  id="firstName" 
                  type="text" 
                  value={buyerName} 
                  onChange={(e) => setBuyerName(e.target.value)} 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="emailCO">E-posta</label>
                <input id="emailCO" type="email" value={email} readOnly disabled />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="company">Şirket Adı</label>
                <input 
                  id="company" 
                  type="text" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="taxId">Vergi No / TC Kimlik</label>
                <input 
                  id="taxId" 
                  type="text" 
                  placeholder="Vergi No / TC Kimlik" 
                  value={taxId} 
                  onChange={(e) => setTaxId(e.target.value)} 
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field} style={{ flex: 2 }}>
                <label htmlFor="address">Adres</label>
                <input 
                  id="address" 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="city">İl / İlçe</label>
                <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="İstanbul / Şişli">İstanbul / Şişli</option>
                  <option value="İstanbul / Beşiktaş">İstanbul / Beşiktaş</option>
                  <option value="Ankara / Çankaya">Ankara / Çankaya</option>
                  <option value="İzmir / Konak">İzmir / Konak</option>
                </select>
              </div>
            </div>
          </section>

          {/* STEP 2: Checkout Form */}
          <section className={`${styles.coSection} ${styles.glass}`}>
            <h2><span className={styles.n}>2</span>Ödeme Yöntemi</h2>
            <p>Tüm ödemeler 3D Secure altyapısıyla korunmaktadır.</p>

            <div className={styles.coPayTabs}>
              <button 
                type="button" 
                className={`${styles.coPayTab} ${paymentMethod === 'iyzico' ? styles.on : ''}`}
                onClick={() => setPaymentMethod('iyzico')}
              >
                <span className={styles.ic}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="11" x2="22" y2="11"/></svg>
                </span>
                <div>
                  <b>Kredi Kartı (İyzico)</b>
                  <span>Visa, Mastercard, Troy</span>
                </div>
              </button>
              <button 
                type="button" 
                className={`${styles.coPayTab} ${paymentMethod === 'stripe' ? styles.on : ''}`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <span className={styles.ic}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="14" rx="2"/><line x1="2" y1="11" x2="22" y2="11"/></svg>
                </span>
                <div>
                  <b>Stripe (Global)</b>
                  <span>Visa, AMEX, Apple Pay</span>
                </div>
              </button>
            </div>

            {/* IYZICO IFRAME FORM */}
            {paymentMethod === 'iyzico' && (
              <div className={styles.payContainer}>
                {isLoadingPayment ? (
                  <div className={styles.iyzipayContainer}>
                    <svg className={styles.spinner} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
                      <path d="M21 12a9 9 0 0 1-9 9"/>
                    </svg>
                    <span style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Ödeme formu oluşturuluyor...</span>
                  </div>
                ) : (
                  <div id="iyzipay-checkout-form" className="responsive"></div>
                )}
              </div>
            )}

            {/* STRIPE BUTTON */}
            {paymentMethod === 'stripe' && (
              <div className={styles.stripeContainer}>
                <button 
                  type="button" 
                  className={styles.stripeBtn} 
                  disabled={isLoadingPayment}
                  onClick={handleStripePay}
                >
                  {isLoadingPayment ? (
                    <>
                      <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
                        <path d="M21 12a9 9 0 0 1-9 9"/>
                      </svg>
                      Yönlendiriliyor...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Stripe ile Güvenli Öde
                    </>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Order Summary */}
        <aside className={`${styles.coSummary} ${styles.glass}`}>
          <h3>Sipariş Özeti</h3>

          <div className={styles.coLine}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {planCode === 'starter' ? 'Standart Plan' : 'Premium Plan'}
              </span>
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-main)', fontWeight: 700 }}>
              ₺{basePrice.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className={styles.coCoupon}>
            <input 
              type="text" 
              placeholder="İndirim kodu" 
              value={couponCode} 
              onChange={(e) => setCouponCode(e.target.value)} 
              disabled={couponApplied}
            />
            <button type="button" onClick={applyCoupon} disabled={couponApplied}>
              {couponApplied ? '✓ Uygulandı' : 'Uygula'}
            </button>
          </div>

          <div className={styles.coLine}>
            <span>Ara Toplam</span>
            <span>₺{basePrice.toLocaleString('tr-TR')},00</span>
          </div>

          {couponApplied && (
            <div className={`${styles.coLine} ${styles.discount}`}>
              <span>İndirim (KAMPANYA10)</span>
              <span>−₺{discount.toLocaleString('tr-TR')},00</span>
            </div>
          )}

          <div className={styles.coLine}>
            <span>KDV (%20)</span>
            <span>₺{kdv.toLocaleString('tr-TR')},00</span>
          </div>

          <div className={`${styles.coLine} ${styles.total}`}>
            <span>{billingInterval === 'Yearly' ? 'Yıllık Toplam' : 'Aylık Toplam'}</span>
            <span className={styles.v}>₺{total.toLocaleString('tr-TR')}</span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', lineHeight: '1.5' }}>
            14 gün boyunca <b style={{ color: 'var(--color-success)' }}>₺0</b> ödersiniz.<br />
            Deneme süresi bitiminde otomatik tahsil edilecektir.
          </div>

          <div className={styles.coTrust}>
            <div className={styles.line}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z"/></svg> Güvenli 3D Secure koruması</div>
            <div className={styles.line}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 30 gün koşulsuz iade garantisi</div>
            <div className={styles.line}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> İstediğiniz an iptal edebilirsiniz</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
