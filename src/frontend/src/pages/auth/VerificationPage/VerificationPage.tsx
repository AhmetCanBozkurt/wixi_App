import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { useTheme } from '../../../app/providers/ThemeProvider';
import styles from './VerificationPage.module.css';

export function VerificationPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secs, setSecs] = useState(59);
  
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('wixi-signup-email');
    if (!storedEmail) {
      toast.error('Lütfen önce kayıt formunu doldurun.');
      navigate('/register');
      return;
    }
    setEmail(storedEmail);

    // Focus first input on mount
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
  }, [navigate]);

  // Resend Countdown timer
  useEffect(() => {
    if (secs <= 0) return;
    const interval = setInterval(() => {
      setSecs((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secs]);

  const handleChange = (val: string, index: number) => {
    setErrorMsg('');
    const cleanVal = val.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal) {
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled or next input
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (secs > 0 || isResending) return;
    setIsResending(true);

    try {
      const response = await apiClient.post('/saas/onboarding/send-otp', { email });
      if (response.data?.devCode) {
        sessionStorage.setItem('wixi-signup-devcode', response.data.devCode);
      }
      toast.success('Doğrulama kodu tekrar gönderildi!');
      setSecs(59);
      setOtp(Array(6).fill(''));
      setErrorMsg('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      toast.error('Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setIsVerifying(true);
    setErrorMsg('');

    // Simulate OTP verification logic
    setTimeout(() => {
      const devCode = sessionStorage.getItem('wixi-signup-devcode');
      // For development, any code works if no devcode is set, but if set, we check for devcode or standard '123456'
      if (devCode && code !== devCode && code !== '123456') {
        setErrorMsg('Kod hatalı. Lütfen tekrar deneyin.');
        setIsVerifying(false);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setIsVerifying(false);
        toast.success('E-posta başarıyla doğrulandı!');
        navigate('/onboarding');
      }
    }, 1200);
  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className={styles.page}>
      {/* Background Orbs */}
      <div className={styles.orbs} aria-hidden={true}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={`${styles.orb} ${styles.orb3}`}></div>
      </div>

      <header className={styles.authTop}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span className={styles.brandName}>WIXI<span className={styles.dim}>APP</span></span>
        </Link>
        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Tema değiştir">
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          )}
        </button>
      </header>

      <main className={styles.authMain}>
        <div className={`${styles.authCard} ${styles.glass}`}>
          <div className={styles.authHead}>
            <div className={styles.mark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>
            </div>
            <h1>E-postanızı doğrulayın</h1>
            <p>
              <b className={styles.emailTarget}>{email || 'ad@isletme.com'}</b> adresine 6 haneli kod gönderdik. Kod 10 dakika geçerlidir.
            </p>
          </div>

          <div className={styles.otpFields} onPaste={handlePaste}>
            {otp.map((char, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]"
                className={`${styles.otpInput} ${char ? styles.filled : ''}`}
                value={char}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => { inputRefs.current[index] = el; }}
              />
            ))}
          </div>

          {errorMsg && <div className={styles.err}>{errorMsg}</div>}

          <button 
            type="button" 
            className={styles.verifyBtn} 
            disabled={!isOtpComplete || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? (
              <>
                <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" strokeOpacity=".25"/>
                  <path d="M21 12a9 9 0 0 1-9 9"/>
                </svg>
                Doğrulanıyor...
              </>
            ) : 'Doğrula →'}
          </button>

          <div className={styles.otpResend}>
            Kodu almadınız mı?{' '}
            <a 
              href="#" 
              onClick={handleResend} 
              className={`${styles.resendLink} ${secs > 0 ? styles.disabledLink : ''}`}
            >
              Tekrar gönder 
              {secs > 0 && (
                <span className={styles.timerText}>
                  (00:{secs.toString().padStart(2, '0')})
                </span>
              )}
            </a>
          </div>

          <div className={styles.authFootLink}>
            <Link to="/register">← Farklı bir e-posta kullan</Link>
          </div>
        </div>

        <div className={styles.authFoot}>
          <Link to="/sss">SSS</Link>
          <a href="#">Yardım</a>
          <span>© 2026 Wixi</span>
        </div>
      </main>
    </div>
  );
}
