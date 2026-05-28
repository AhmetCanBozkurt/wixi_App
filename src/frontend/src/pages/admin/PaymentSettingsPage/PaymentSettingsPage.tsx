import { useState, useEffect } from 'react';
import { FaCreditCard, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { Button, Input } from '../../../shared/ui';
import s from './PaymentSettingsPage.module.css';

interface PlatformPaymentSettings {
  hasStripeSecretKey: boolean;
  stripeSecretKeyHint: string | null;
  stripePublishableKey: string | null;
  hasStripeWebhookSecret: boolean;
  stripeWebhookSecretHint: string | null;
  hasIyzipayApiKey: boolean;
  iyzipayApiKeyHint: string | null;
  hasIyzipaySecretKey: boolean;
  iyzipaySecretKeyHint: string | null;
  iyzipayBaseUrl: string;
}

interface FormState {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  iyzipayApiKey: string;
  iyzipaySecretKey: string;
  iyzipayBaseUrl: string;
}

const EMPTY_FORM: FormState = {
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripeWebhookSecret: '',
  iyzipayApiKey: '',
  iyzipaySecretKey: '',
  iyzipayBaseUrl: '',
};

export const PaymentSettingsPage = () => {
  const [current, setCurrent] = useState<PlatformPaymentSettings | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const res = await apiClient.get<PlatformPaymentSettings>('admin/payment-settings');
      setCurrent(res.data);
      setForm(f => ({
        ...f,
        stripePublishableKey: res.data.stripePublishableKey ?? '',
        iyzipayBaseUrl: res.data.iyzipayBaseUrl ?? 'https://sandbox-api.iyzipay.com',
      }));
    } catch {
      toast.error('Ödeme ayarları yüklenemedi.');
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (field: string) =>
    setVisible(v => ({ ...v, [field]: !v[field] }));

  const handleSave = async () => {
    const payload: Record<string, string | null> = {};
    if (form.stripeSecretKey) payload.stripeSecretKey = form.stripeSecretKey;
    if (form.stripePublishableKey) payload.stripePublishableKey = form.stripePublishableKey;
    if (form.stripeWebhookSecret) payload.stripeWebhookSecret = form.stripeWebhookSecret;
    if (form.iyzipayApiKey) payload.iyzipayApiKey = form.iyzipayApiKey;
    if (form.iyzipaySecretKey) payload.iyzipaySecretKey = form.iyzipaySecretKey;
    if (form.iyzipayBaseUrl) payload.iyzipayBaseUrl = form.iyzipayBaseUrl;

    setIsSaving(true);
    try {
      await apiClient.put('admin/payment-settings', payload);
      toast.success('Ödeme ayarları kaydedildi.');
      setForm(EMPTY_FORM);
      await load();
    } catch {
      toast.error('Kayıt başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const SecretInput = ({
    field,
    label,
    hint,
    hasValue,
  }: {
    field: keyof FormState;
    label: string;
    hint: string | null;
    hasValue: boolean;
  }) => (
    <div className={s.fieldWrap}>
      <label className={s.label}>{label}</label>
      {hasValue && !form[field] && (
        <div className={s.existingHint}>
          <span className={s.savedBadge}>Kayıtlı</span>
          <span className={s.hint}>{hint}</span>
          <button
            type="button"
            className={s.changeBtn}
            onClick={() => setForm(f => ({ ...f, [field]: ' ' }))}
          >
            Değiştir
          </button>
        </div>
      )}
      {(!hasValue || form[field]) && (
        <div className={s.inputRow}>
          <Input
            type={visible[field] ? 'text' : 'password'}
            value={form[field].trim() === '' ? '' : form[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            placeholder={hasValue ? 'Yeni değer girin (boş bırakırsanız mevcut korunur)' : 'Key girin'}
          />
          <button type="button" className={s.eyeBtn} onClick={() => toggle(field)}>
            {visible[field] ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <FaCreditCard className={s.icon} />
        <div>
          <h1 className={s.title}>Ödeme Gateway Ayarları</h1>
          <p className={s.subtitle}>
            Stripe ve Iyzipay API anahtarları şifreli olarak veritabanında saklanır.
          </p>
        </div>
      </div>

      <div className={s.grid}>
        {/* ── Stripe ────────────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <SiStripe className={s.stripeIcon} />
            <span>Stripe</span>
          </div>
          <div className={s.cardBody}>
            <SecretInput
              field="stripeSecretKey"
              label="Secret Key (sk_live_... / sk_test_...)"
              hint={current?.stripeSecretKeyHint ?? null}
              hasValue={current?.hasStripeSecretKey ?? false}
            />
            <div className={s.fieldWrap}>
              <label className={s.label}>Publishable Key (pk_...)</label>
              <Input
                value={form.stripePublishableKey}
                onChange={e => setForm(f => ({ ...f, stripePublishableKey: e.target.value }))}
                placeholder="pk_live_... veya pk_test_..."
              />
            </div>
            <SecretInput
              field="stripeWebhookSecret"
              label="Webhook Secret (whsec_...)"
              hint={current?.stripeWebhookSecretHint ?? null}
              hasValue={current?.hasStripeWebhookSecret ?? false}
            />
          </div>
        </div>

        {/* ── Iyzipay ───────────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <FaCreditCard className={s.iyzipayIcon} />
            <span>Iyzipay</span>
          </div>
          <div className={s.cardBody}>
            <SecretInput
              field="iyzipayApiKey"
              label="API Key"
              hint={current?.iyzipayApiKeyHint ?? null}
              hasValue={current?.hasIyzipayApiKey ?? false}
            />
            <SecretInput
              field="iyzipaySecretKey"
              label="Secret Key"
              hint={current?.iyzipaySecretKeyHint ?? null}
              hasValue={current?.hasIyzipaySecretKey ?? false}
            />
            <div className={s.fieldWrap}>
              <label className={s.label}>Base URL</label>
              <Input
                value={form.iyzipayBaseUrl}
                onChange={e => setForm(f => ({ ...f, iyzipayBaseUrl: e.target.value }))}
                placeholder="https://sandbox-api.iyzipay.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={s.actions}>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          <FaSave style={{ marginRight: 6 }} />
          Kaydet
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
