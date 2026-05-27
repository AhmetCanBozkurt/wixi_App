import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useTheme } from '../../../app/providers/ThemeProvider';
import styles from './PlanSelectionPage.module.css';

interface PlanDto {
  id: string;
  name: string;
  code: string;
  priceMonthly: number;
  priceYearly: number;
  featuresJson: string;
  maxProducts: number;
  maxUsers: number;
  sortOrder: number;
}

export function PlanSelectionPage() {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState('pro'); // default to premium (pro)
  const [billMode, setBillMode] = useState<'m' | 'y'>('m'); // m: monthly, y: yearly
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const email = sessionStorage.getItem('wixi-signup-email');
    if (!email) {
      toast.error('Lütfen önce kayıt olun.');
      navigate('/register');
      return;
    }

    const fetchPlans = async () => {
      try {
        const response = await apiClient.get<PlanDto[]>('/plans');
        // Filter out free plan from main selection card grid if needed, or keep all
        const activePlans = response.data || [];
        setPlans(activePlans);
        
        // Find default plan (pro/premium) if it exists, otherwise use first plan
        const hasPro = activePlans.some(p => p.code === 'pro');
        if (hasPro) {
          setSelectedPlanCode('pro');
        } else if (activePlans.length > 0) {
          setSelectedPlanCode(activePlans[0].code);
        }
      } catch {
        toast.error('Plan bilgileri yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [navigate]);

  const handlePlanSelect = (code: string) => {
    setSelectedPlanCode(code);
  };

  const handleContinue = async () => {
    if (selectedPlanCode === 'kurumsal') {
      toast.success('Talebiniz alındı! Satış ekibimiz sizinle iletişime geçecektir.');
      return;
    }

    const storeName = sessionStorage.getItem('wixi-signup-store-name') || '';
    const slug = sessionStorage.getItem('wixi-signup-slug') || '';
    const email = sessionStorage.getItem('wixi-signup-email') || '';
    const password = sessionStorage.getItem('wixi-signup-password') || '';
    
    let modulesList: string[] = ['ecommerce'];
    const storedModules = sessionStorage.getItem('wixi-signup-modules');
    if (storedModules) {
      try {
        modulesList = JSON.parse(storedModules);
      } catch {
        modulesList = ['ecommerce'];
      }
    }

    setIsSubmitting(true);
    try {
      // Register tenant with plan details
      const response = await apiClient.post('/saas/onboarding/register', {
        storeName,
        slug,
        ownerEmail: email,
        password,
        planCode: selectedPlanCode,
        selectedModules: modulesList,
      });

      const { token, requiresPayment, slug: tenantSlug, tenantId } = response.data;

      // Store JWT token to authenticate user directly
      if (token) {
        localStorage.setItem('token', token);
      }

      // Save registration context to sessionStorage for the checkout step
      sessionStorage.setItem('wixi-checkout-tenant-id', tenantId);
      sessionStorage.setItem('wixi-checkout-slug', tenantSlug);
      sessionStorage.setItem('wixi-checkout-plan-code', selectedPlanCode);
      sessionStorage.setItem('wixi-checkout-billing-interval', billMode === 'm' ? 'Monthly' : 'Yearly');

      if (requiresPayment) {
        toast.success('Mağaza oluşturuldu, ödeme sayfasına yönlendiriliyorsunuz...');
        navigate('/checkout/saas');
      } else {
        toast.success('Tebrikler! Mağazanız başarıyla oluşturuldu.');
        navigate(`/checkout/success?tenant=${tenantSlug}&paid=false`);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      const msg = err?.response?.data?.error || 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanDetails = (code: string) => {
    return plans.find(p => p.code === code);
  };

  const starterPlan = getPlanDetails('starter');
  const proPlan = getPlanDetails('pro');

  // Pricing helper
  const getPrice = (plan: PlanDto | undefined) => {
    if (!plan) return 0;
    return billMode === 'm' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
  };

  const getPlanNameText = (code: string) => {
    if (code === 'starter') return 'Standart';
    if (code === 'pro') return 'Premium';
    return 'Plan';
  };

  const selectedPlanObj = plans.find(p => p.code === selectedPlanCode);
  const selectedPrice = getPrice(selectedPlanObj);

  return (
    <div className={styles.plansPage}>
      {/* Background Orbs */}
      <div className={styles.orbs} aria-hidden={true}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
      </div>

      <header className={styles.coTop}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span className={styles.brandName}>WIXI<span className={styles.dim}>APP</span></span>
        </Link>
        <div className={styles.coStepper}>
          <div className={`${styles.step} ${styles.stepCur}`}><span className={styles.n}><span>1</span></span><b>Plan</b></div>
          <div className={styles.sep}></div>
          <div className={styles.step}><span className={styles.n}><span>2</span></span><b>Ödeme</b></div>
          <div className={styles.sep}></div>
          <div className={styles.step}><span className={styles.n}><span>3</span></span><b>Onay</b></div>
        </div>
        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Tema değiştir">
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          )}
        </button>
      </header>

      <main>
        <div className={styles.plansPageHead}>
          <span className={styles.eyebrow}><span className={styles.dot}></span>Plan Seçimi</span>
          <h1>İhtiyacınıza uygun <span className={styles.gradText}>planı seçin</span></h1>
          <p>İstediğiniz an yükseltin veya düşürün. 14 gün ücretsiz başlar, sonra siz karar verirsiniz.</p>

          <div className={styles.billToggle}>
            <span 
              className={styles.billTogglePill} 
              style={{
                left: billMode === 'm' ? '5px' : 'calc(50% - 2px)',
                width: 'calc(50% - 2px)'
              }}
            ></span>
            <button 
              type="button" 
              className={billMode === 'm' ? styles.active : ''} 
              onClick={() => setBillMode('m')}
            >
              Aylık
            </button>
            <button 
              type="button" 
              className={billMode === 'y' ? styles.active : ''} 
              onClick={() => setBillMode('y')}
            >
              Yıllık <span className={styles.save}>−%20</span>
            </button>
          </div>
        </div>

        {isLoadingPlans ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <svg className={styles.spinner} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
              <path d="M21 12a9 9 0 0 1-9 9"/>
            </svg>
          </div>
        ) : (
          <div className={styles.plansGrid}>
            {/* STANDART (STARTER) */}
            <article 
              className={`${styles.plan} ${selectedPlanCode === 'starter' ? styles.planSelected : ''}`}
              onClick={() => handlePlanSelect('starter')}
            >
              <div className={styles.planIc}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 7v10l8 5 8-5V7z"/></svg>
              </div>
              <div className={styles.planName}>Standart</div>
              <div className={styles.planPrice}>
                <span className={styles.currency}>₺</span>
                <span className={styles.amt}>{getPrice(starterPlan)}</span>
                <span className={styles.per}>/ay</span>
              </div>
              {billMode === 'y' && starterPlan && (
                <div className={`${styles.planOld} ${styles.show}`}>₺{starterPlan.priceMonthly}/ay</div>
              )}
              <p className={styles.planDesc}>Yeni başlayan girişimciler için temel modül paketi.</p>
              <ul>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 1 modül (E-Ticaret veya CRM)</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 500 ürün/kayıt</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 3 kullanıcı</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> E-posta destek</li>
              </ul>
              <button 
                type="button" 
                className={`${styles.planBtn} ${selectedPlanCode === 'starter' ? styles.planBtnPrimary : ''}`}
              >
                Bu planı seç
              </button>
            </article>

            {/* PREMIUM (PRO) */}
            <article 
              className={`${styles.plan} ${selectedPlanCode === 'pro' ? styles.planSelected : ''}`}
              onClick={() => handlePlanSelect('pro')}
            >
              <span className={styles.planBadge}>★ En Popüler</span>
              <div className={styles.planIc} style={{ background: 'rgba(139,92,246,.12)', color: '#c4b5fd', borderColor: 'rgba(139,92,246,.35)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>
              </div>
              <div className={styles.planName}>Premium</div>
              <div className={styles.planPrice}>
                <span className={styles.currency}>₺</span>
                <span className={styles.amt}>{getPrice(proPlan)}</span>
                <span className={styles.per}>/ay</span>
              </div>
              {billMode === 'y' && proPlan && (
                <div className={`${styles.planOld} ${styles.show}`}>₺{proPlan.priceMonthly}/ay</div>
              )}
              <p className={styles.planDesc}>Büyüyen işletmeler için tüm modüller dahil.</p>
              <ul>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 35+ modülün tamamı</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Sınırsız ürün/kayıt</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> 15 kullanıcı</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Öncelikli canlı destek</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Özel domain + tema editörü</li>
              </ul>
              <button 
                type="button" 
                className={`${styles.planBtn} ${selectedPlanCode === 'pro' ? styles.planBtnPrimary : ''}`}
              >
                Bu planı seç
              </button>
            </article>

            {/* KURUMSAL */}
            <article 
              className={`${styles.plan} ${selectedPlanCode === 'kurumsal' ? styles.planSelected : ''}`}
              onClick={() => handlePlanSelect('kurumsal')}
            >
              <div className={styles.planIc}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div className={styles.planName}>Kurumsal</div>
              <div className={styles.planPrice}>
                <span className={styles.amt} style={{ fontSize: '38px' }}>Özel</span>
              </div>
              <p className={styles.planDesc}>Büyük ekipler ve özel ihtiyaçlar için tailored çözüm.</p>
              <ul>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Premium'daki her şey</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Sınırsız kullanıcı</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Adanmış hesap yöneticisi</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> SLA + on-premise</li>
              </ul>
              <button 
                type="button" 
                className={`${styles.planBtn} ${selectedPlanCode === 'kurumsal' ? styles.planBtnPrimary : ''}`}
              >
                Satış ile görüş
              </button>
            </article>
          </div>
        )}

        <div className={styles.continueBar}>
          <div className={styles.continueBarInfo}>
            <b>{selectedPlanCode === 'kurumsal' ? 'Kurumsal Plan' : `${getPlanNameText(selectedPlanCode)} Plan`}</b>
            <span>
              {selectedPlanCode === 'kurumsal' 
                ? 'Özel fiyatlandırma seçenekleri' 
                : `${billMode === 'm' ? 'Aylık' : 'Yıllık'} ödeme · ₺${selectedPrice.toLocaleString('tr-TR')}/ay · 14 gün ücretsiz`}
            </span>
          </div>
          <button 
            type="button" 
            className={styles.btnPrimaryLg} 
            disabled={isSubmitting || isLoadingPlans}
            onClick={handleContinue}
          >
            {isSubmitting ? (
              <>
                <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
                  <path d="M21 12a9 9 0 0 1-9 9"/>
                </svg>
                Kuruluyor...
              </>
            ) : selectedPlanCode === 'kurumsal' ? 'Destek Al →' : 'Ödemeye Geç →'}
          </button>
        </div>
      </main>
    </div>
  );
}
