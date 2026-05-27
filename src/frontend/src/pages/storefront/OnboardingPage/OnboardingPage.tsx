import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../app/providers/ThemeProvider';
import styles from './OnboardingPage.module.css';

interface ModuleOption {
  id: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
}

const MODULES: ModuleOption[] = [
  { id: 'eticaret', name: 'E-Ticaret', desc: 'Mağaza', price: 499, emoji: '🛒' },
  { id: 'crm', name: 'CRM', desc: 'Müşteri ilişkileri', price: 399, emoji: '👥' },
  { id: 'stok', name: 'Stok', desc: 'Sayım, lokasyon', price: 199, emoji: '📦' },
  { id: 'muhasebe', name: 'Muhasebe', desc: 'E-fatura, KDV', price: 349, emoji: '📊' },
  { id: 'ik', name: 'İK', desc: 'Personel, bordro', price: 299, emoji: '💼' },
  { id: 'kargo', name: 'Kargo', desc: 'Aras, MNG, Yurtiçi', price: 129, emoji: '🚚' },
];

const SECTORS = [
  { id: 'retail', name: 'Perakende', desc: 'Mağaza, butik', emoji: '🛍️' },
  { id: 'ecom', name: 'E-Ticaret', desc: 'Online satış', emoji: '📦' },
  { id: 'food', name: 'Gıda / Restoran', desc: 'Kafe, fırın, lokanta', emoji: '🍰' },
  { id: 'service', name: 'Hizmet', desc: 'Kuaför, atölye', emoji: '💇' },
  { id: 'textile', name: 'Tekstil & Moda', desc: 'Üretim, satış', emoji: '👗' },
  { id: 'manufacture', name: 'Üretim', desc: 'Küçük üretici', emoji: '🏭' },
  { id: 'health', name: 'Sağlık & Estetik', desc: 'Klinik, eczane', emoji: '⚕️' },
  { id: 'consult', name: 'Danışmanlık', desc: 'Hizmet sağlayıcı', emoji: '💼' },
  { id: 'other', name: 'Diğer', desc: 'Daha sonra söyleyeceğim', emoji: '✨' },
];

const COLORS = [
  { id: 'indigo', label: 'Indigo', value: 'linear-gradient(135deg,#6366f1,#8b5cf6)', hex: '#6366f1' },
  { id: 'emerald', label: 'Emerald', value: 'linear-gradient(135deg,#10b981,#06b6d4)', hex: '#10b981' },
  { id: 'amber', label: 'Amber', value: 'linear-gradient(135deg,#f59e0b,#ef4444)', hex: '#f59e0b' },
  { id: 'pink', label: 'Pink', value: 'linear-gradient(135deg,#ec4899,#8b5cf6)', hex: '#ec4899' },
  { id: 'slate', label: 'Slate', value: 'linear-gradient(135deg,#0f172a,#475569)', hex: '#0f172a' },
  { id: 'cyan', label: 'Cyan', value: 'linear-gradient(135deg,#06b6d4,#3b82f6)', hex: '#06b6d4' },
  { id: 'orange', label: 'Orange', value: 'linear-gradient(135deg,#fb923c,#dc2626)', hex: '#fb923c' },
  { id: 'gray', label: 'Gray', value: 'linear-gradient(135deg,#a3a3a3,#525252)', hex: '#a3a3a3' },
];

export function OnboardingPage() {
  const [curStep, setCurStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState('');
  const [employeeCount, setEmployeeCount] = useState('Yalnız ben');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedFont, setSelectedFont] = useState('jakarta');

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const email = sessionStorage.getItem('wixi-signup-email');
    if (!email) {
      toast.error('Lütfen önce kayıt olun.');
      navigate('/register');
    }
  }, [navigate]);

  const handleSectorSelect = (id: string) => {
    setSelectedSector(id);
  };

  const handleModuleToggle = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectRecommended = () => {
    const recs = ['eticaret', 'stok', 'crm'];
    setSelectedModules(recs);
    toast.success('Önerilen paket seçildi.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo en fazla 2MB boyutunda olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result as string);
      toast.success('Logo yüklendi!');
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => {
    if (curStep === 1 && !selectedSector) {
      toast.error('Lütfen sektörünüzü seçin.');
      return;
    }
    if (curStep === 2 && selectedModules.length === 0) {
      toast.error('Lütfen en az bir başlangıç modülü seçin.');
      return;
    }
    if (curStep < 4) {
      setCurStep((prev) => prev + 1);
    } else {
      // Save all onboarding state to sessionStorage
      const onboardingData = {
        sector: selectedSector,
        employeeCount,
        modules: selectedModules,
        logo: logoBase64,
        color: selectedColor,
        font: selectedFont,
      };
      sessionStorage.setItem('wixi-onboarding', JSON.stringify(onboardingData));
      
      // Also save modules explicitly for the register payload
      sessionStorage.setItem('wixi-signup-modules', JSON.stringify(selectedModules));

      navigate('/select-plan');
    }
  };

  const prevStep = () => {
    if (curStep > 1) {
      setCurStep((prev) => prev - 1);
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    // Default mock onboarding and proceed to plans
    const defaultData = {
      sector: 'other',
      employeeCount: 'Yalnız ben',
      modules: ['eticaret'],
      logo: null,
      color: 'indigo',
      font: 'jakarta',
    };
    sessionStorage.setItem('wixi-onboarding', JSON.stringify(defaultData));
    sessionStorage.setItem('wixi-signup-modules', JSON.stringify(['eticaret']));
    navigate('/select-plan');
  };

  // Calculate 14 days trial expiration dynamically
  const getTrialExpiryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const selectedModulesTotal = MODULES
    .filter((m) => selectedModules.includes(m.id))
    .reduce((sum, m) => sum + m.price, 0);

  return (
    <div className={styles.obShell}>
      {/* Background Orbs */}
      <div className={styles.orbs} aria-hidden={true}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
      </div>

      {/* SIDEBAR */}
      <aside className={styles.obSide}>
        <div>
          <div className={styles.obSideBrand}>
            <span className={styles.mark}>W</span>
            <span className={styles.brandName}>WIXI<span className={styles.brandNameMuted}>APP</span></span>
          </div>

          <div style={{ marginTop: '32px' }}>
            <div className={styles.obProgressText}>Adım {curStep} / 4</div>
            <div className={styles.obSteps}>
              <button 
                type="button" 
                className={`${styles.obStep} ${curStep === 1 ? styles.active : ''} ${curStep > 1 ? styles.done : ''}`}
                onClick={() => selectedSector && setCurStep(1)}
              >
                <div className={styles.obStepNum}><span>1</span></div>
                <div className={styles.obStepInfo}>
                  <b>Sektörünüz</b>
                  <span>Şablon önerisi için</span>
                </div>
              </button>
              <button 
                type="button" 
                className={`${styles.obStep} ${curStep === 2 ? styles.active : ''} ${curStep > 2 ? styles.done : ''}`}
                onClick={() => selectedSector && setCurStep(2)}
              >
                <div className={styles.obStepNum}><span>2</span></div>
                <div className={styles.obStepInfo}>
                  <b>Modüller</b>
                  <span>İhtiyacınız olanlar</span>
                </div>
              </button>
              <button 
                type="button" 
                className={`${styles.obStep} ${curStep === 3 ? styles.active : ''} ${curStep > 3 ? styles.done : ''}`}
                onClick={() => selectedSector && selectedModules.length > 0 && setCurStep(3)}
              >
                <div className={styles.obStepNum}><span>3</span></div>
                <div className={styles.obStepInfo}>
                  <b>Marka kimliği</b>
                  <span>Logo, renk ve font</span>
                </div>
              </button>
              <button 
                type="button" 
                className={`${styles.obStep} ${curStep === 4 ? styles.active : ''}`}
                onClick={() => selectedSector && selectedModules.length > 0 && setCurStep(4)}
              >
                <div className={styles.obStepNum}><span>4</span></div>
                <div className={styles.obStepInfo}>
                  <b>Hoş geldiniz</b>
                  <span>İlk adımlarınız</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.obSideSupport}>
          <b>Yardıma mı ihtiyacınız var?</b><br />
          <a href="/sss" target="_blank">SSS</a> · <a href="#">Canlı destek</a>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className={styles.obContent}>
        <div className={styles.obContentInner}>
          
          {/* STEP 1: SECTOR */}
          <div className={`${styles.obPanel} ${curStep === 1 ? styles.obPanelActive : ''}`}>
            <div>
              <span className={styles.eyebrow}><span className={styles.dot}></span>Adım 1 / 4</span>
              <h1 style={{ marginTop: '14px' }}>İşletmeniz hangi <span className={styles.gradText}>sektörde</span>?</h1>
              <p className={styles.lead}>Sektörünüze özel hazır şablonlar ve modül önerileri sunalım.</p>
            </div>

            <div className={styles.sectorGrid}>
              {SECTORS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.sector} ${selectedSector === s.id ? styles.sectorOn : ''}`}
                  onClick={() => handleSectorSelect(s.id)}
                >
                  <span className={styles.emoji}>{s.emoji}</span>
                  <b>{s.name}</b>
                  <span>{s.desc}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className={styles.field} style={{ maxWidth: '340px' }}>
                <label htmlFor="staff">Kaç kişi çalışıyor?</label>
                <select 
                  id="staff" 
                  value={employeeCount} 
                  onChange={(e) => setEmployeeCount(e.target.value)}
                >
                  <option value="Yalnız ben">Yalnız ben</option>
                  <option value="2 — 5">2 — 5</option>
                  <option value="6 — 15">6 — 15</option>
                  <option value="16 — 50">16 — 50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: MODULES */}
          <div className={`${styles.obPanel} ${curStep === 2 ? styles.obPanelActive : ''}`}>
            <div>
              <span className={styles.eyebrow}><span className={styles.dot}></span>Adım 2 / 4</span>
              <h1 style={{ marginTop: '14px' }}>Hangi <span className={styles.gradText}>modüllerle</span> başlayacaksınız?</h1>
              <p className={styles.lead}>Birkaç modülle başlayın, ihtiyaca göre sonra ekleyebilirsiniz. Hepsi 14 gün ücretsiz.</p>
            </div>

            <div className={styles.recBox}>
              <span className={styles.recIc}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></polygon></svg>
              </span>
              <div className={styles.recText}>
                <b>Önerilen:</b> Seçtiğiniz sektör için <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>E-Ticaret + Stok + CRM</span> en sık tercih ediliyor.
              </div>
              <button type="button" className={styles.btnSm} onClick={selectRecommended}>Bu paketi seç</button>
            </div>

            <div className={styles.sectorGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.sector} ${selectedModules.includes(m.id) ? styles.sectorOn : ''}`}
                  onClick={() => handleModuleToggle(m.id)}
                  style={{ flexDirection: 'row', textAlign: 'left', alignItems: 'center', gap: '14px', padding: '14px 16px' }}
                >
                  <span className={styles.emoji}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <b style={{ display: 'block' }}>{m.name}</b>
                    <span style={{ fontSize: '11px' }}>{m.desc} · ₺{m.price}/ay</span>
                  </div>
                </button>
              ))}
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalCount}>
                <b id="selModCount">{selectedModules.length} modül</b> seçili
              </span>
              <span className={styles.totalPrice}>
                <b id="selModTotal">₺{selectedModulesTotal.toLocaleString('tr-TR')}</b> / ay
              </span>
            </div>

            <p className={styles.onboardingNote}>
              📍 Tüm modüller 14 gün ücretsiz. <a href="/moduller" target="_blank">35+ modülün tamamını görün →</a>
            </p>
          </div>

          {/* STEP 3: BRAND */}
          <div className={`${styles.obPanel} ${curStep === 3 ? styles.obPanelActive : ''}`}>
            <div>
              <span className={styles.eyebrow}><span className={styles.dot}></span>Adım 3 / 4</span>
              <h1 style={{ marginTop: '14px' }}>Marka kimliğinizi <span className={styles.gradText}>tanıyalım</span></h1>
              <p className={styles.lead}>Renk paleti ve logoyu sonra değiştirebilirsiniz.</p>
            </div>

            <div className={styles.brandGrid}>
              <div>
                <label className={styles.logoLabel}>Logo</label>
                <label htmlFor="logoFileInput" className={styles.logoDrop}>
                  <input
                    id="logoFileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Logo" className={styles.uploadedLogoPreview} />
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <b>Logonuzu yükleyin</b>
                      <span>Dosya seçmek için tıklayın · PNG, SVG, JPG · max 2MB</span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className={styles.logoLabel}>Marka rengi</label>
                <div className={styles.colorSwatches}>
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.colorSwatch} ${selectedColor === c.id ? styles.colorSwatchSel : ''}`}
                      style={{ background: c.value }}
                      onClick={() => setSelectedColor(c.id)}
                      title={c.label}
                    />
                  ))}
                </div>

                <label className={styles.logoLabel} style={{ margin: '18px 0 8px' }}>Yazı tipi</label>
                <div className={styles.fontPicker}>
                  <button 
                    type="button" 
                    className={`${styles.sector} ${styles.fontBtn} ${selectedFont === 'jakarta' ? styles.sectorOn : ''}`}
                    onClick={() => setSelectedFont('jakarta')}
                  >
                    <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '16px', fontWeight: 700 }}>Aa</span> 
                    <span style={{ marginLeft: '10px', fontSize: '13px' }}>Plus Jakarta Sans</span>
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.sector} ${styles.fontBtn} ${selectedFont === 'inter' ? styles.sectorOn : ''}`}
                    onClick={() => setSelectedFont('inter')}
                  >
                    <span style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: 700 }}>Aa</span> 
                    <span style={{ marginLeft: '10px', fontSize: '13px' }}>Inter</span>
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.sector} ${styles.fontBtn} ${selectedFont === 'serif' ? styles.sectorOn : ''}`}
                    onClick={() => setSelectedFont('serif')}
                  >
                    <span style={{ fontFamily: 'Georgia', fontSize: '16px', fontWeight: 700 }}>Aa</span> 
                    <span style={{ marginLeft: '10px', fontSize: '13px' }}>Klasik Serif</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: WELCOME */}
          <div className={`${styles.obPanel} ${curStep === 4 ? styles.obPanelActive : ''}`}>
            <div className={styles.welcomeTitleContainer}>
              <div className={styles.welcomeBurst}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h1>Hesabınız <span className={styles.gradText}>hazır!</span></h1>
              <p className={styles.lead}>Aşağıdaki adımlarla ilk değerinizi 2 dakikada elde edebilirsiniz.</p>
            </div>

            <div className={styles.welcomeGrid}>
              <article className={styles.welcomeTile}>
                <div className={styles.tileIc}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
                </div>
                <b>İlk ürününüzü ekleyin</b>
                <p>Sadece adı, fiyatı ve görseli ile başlayın — geri kalanı sonradan.</p>
                <a href="#">Ürün ekle →</a>
              </article>
              <article className={styles.welcomeTile}>
                <div className={styles.tileIc}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                </div>
                <b>Mağazanızı özelleştirin</b>
                <p>Tema editörüyle anasayfa, ürün listesi, hakkında sayfasını düzenleyin.</p>
                <a href="#">Tema editörü →</a>
              </article>
              <article className={styles.welcomeTile}>
                <div className={styles.tileIc}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <b>Entegrasyonları bağlayın</b>
                <p>Kargo, ödeme, e-posta — kullanmak istediklerinizi tek tıkla aktifleştirin.</p>
                <a href="#">Entegrasyonlar →</a>
              </article>
            </div>

            <div className={styles.trialBanner}>
              <div className={styles.trialBannerText}>
                <b>Bedava deneme süreniz</b>
                <span>14 gün — {getTrialExpiryDate()}'da sona eriyor</span>
              </div>
              <button type="button" className={styles.trialBtn} onClick={nextStep}>Şimdi Yükselt</button>
            </div>
          </div>

          {/* NAVIGATION FOOTER */}
          <div className={styles.obNav}>
            <a href="#" className={styles.skip} onClick={handleSkip}>Şimdilik atla</a>
            <div className={styles.navRight}>
              {curStep > 1 && (
                <button type="button" className={styles.btnPrev} onClick={prevStep}>
                  ← Geri
                </button>
              )}
              <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                {curStep === 4 ? 'Plan Seçimine Git →' : 'Devam Et →'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
