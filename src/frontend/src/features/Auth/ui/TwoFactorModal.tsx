import { useEffect, useMemo, useState } from 'react';
import { FaShieldAlt, FaClock } from 'react-icons/fa';
import { apiClient } from '../../../shared/api/axiosConfig';
import styles from './TwoFactorModal.module.css';

type Props = {
  isOpen: boolean;
  twoFactorToken: string | null;
  rememberMe: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void | Promise<void>;
};

export const TwoFactorModal = ({ isOpen, twoFactorToken, rememberMe, onClose, onSuccess }: Props) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const code = useMemo(() => digits.join(''), [digits]);

  useEffect(() => {
    if (!isOpen) return;
    setDigits(['', '', '', '', '', '']);
    setSecondsLeft(5 * 60);
    setErrorText(null);
    setShake(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [isOpen]);

  if (!isOpen) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const submit = async () => {
    if (!twoFactorToken) return;
    if (code.length !== 6) return;
    setIsSubmitting(true);
    setErrorText(null);
    try {
      const res = await apiClient.post('/Auth/verify-2fa', {
        twoFactorToken,
        otpCode: code,
        rememberMe,
      });
      const token = res.data?.token || res.data?.accessToken;
      if (token) await onSuccess(token);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Doğrulama başarısız.';
      setErrorText(msg);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (!twoFactorToken || isResending) return;
    setIsResending(true);
    setErrorText(null);
    try {
      await apiClient.post('/Auth/resend-2fa', { twoFactorToken });
      setSecondsLeft(5 * 60);
      setDigits(['', '', '', '', '', '']);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Kod yeniden gönderilemedi.';
      setErrorText(msg);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setIsResending(false);
    }
  };

  const applyFullCode = (raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '').slice(0, 6);
    if (!onlyDigits) return;
    const next = Array.from({ length: 6 }, (_, i) => onlyDigits[i] ?? '');
    setDigits(next);
    const focusIndex = Math.min(onlyDigits.length, 5);
    const el = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement | null;
    el?.focus();
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={`${styles.modal} ${shake ? styles.shake : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.badge} aria-hidden="true">
              <FaShieldAlt />
            </div>
            <div>
              <div className={styles.title}>İki Aşamalı Doğrulama</div>
              <div className={styles.subtitle}>
                E-postanıza gelen 6 haneli kodu girin
              </div>
            </div>
          </div>

          <button className={styles.close} onClick={onClose} aria-label="Kapat">×</button>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.timerPill}>
            <FaClock />
            <span>Süre</span>
            <strong>{mm}:{ss}</strong>
          </div>
          <div className={styles.hint}>Kod 5 dakika geçerlidir.</div>
        </div>

        {errorText && <div className={styles.errorBox}>{errorText}</div>}

        <div className={styles.otpRow}>
          {digits.map((d, idx) => (
            <input
              key={idx}
              className={styles.otpInput}
              value={d}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text && text.length >= 2) {
                  e.preventDefault();
                  applyFullCode(text);
                }
              }}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                setDigits((prev) => {
                  const next = [...prev];
                  next[idx] = v;
                  return next;
                });
                if (v && idx < 5) {
                  const nextEl = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
                  nextEl?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
                  const prevEl = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null;
                  prevEl?.focus();
                }
              }}
              id={`otp-${idx}`}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <button className={styles.secondary} onClick={onClose} disabled={isSubmitting || isResending}>
              Vazgeç
            </button>
            <button
              className={styles.linkBtn}
              onClick={resend}
              disabled={isSubmitting || isResending || secondsLeft > 0}
              title={secondsLeft > 0 ? 'Süre bitince yeniden gönderebilirsiniz' : 'Kodu yeniden gönder'}
            >
              {isResending ? 'Gönderiliyor…' : 'Kodu yeniden gönder'}
            </button>
          </div>
          <button
            className={styles.primary}
            onClick={submit}
            disabled={isSubmitting || isResending || code.length !== 6 || secondsLeft === 0}
          >
            {isSubmitting ? 'Doğrulanıyor…' : 'Doğrula'}
          </button>
        </div>
      </div>
    </div>
  );
};

