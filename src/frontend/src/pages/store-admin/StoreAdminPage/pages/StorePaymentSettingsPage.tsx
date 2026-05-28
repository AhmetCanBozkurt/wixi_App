import { useState, useEffect } from 'react';
import { FaCreditCard, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../../shared/api/axiosConfig';
import { Button, Input, Select } from '../../../../shared/ui';
import s from './storeAdmin.shared.module.css';
import ps from './StorePaymentSettingsPage.module.css';

interface TenantPaymentSettings {
  activeGateway: string;
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
  activeGateway: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  iyzipayApiKey: string;
  iyzipaySecretKey: string;
  iyzipayBaseUrl: string;
}

const GATEWAY_OPTIONS = [
  { label: 'Platform Varsayılanı (Super Admin Ayarları)', value: 'platform_default' },
  { label: 'Iyzipay (Kendi Hesabım)', value: 'iyzipay' },
  { label: 'Stripe (Kendi Hesabım)', value: 'stripe' },
];

export const StorePaymentSettingsPage = () => {
  const [current, setCurrent] = useState<TenantPaymentSettings | null>(null);
  const [form, setForm] = useState<FormState>({
    activeGateway: 'platform_default',
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    iyzipayApiKey: '',
    iyzipaySecretKey: '',
    iyzipayBaseUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      const res = await apiClient.get<TenantPaymentSettings>('store-admin/payment-settings');
      setCurrent(res.data);
      setForm(f => ({
        ...f,
        activeGateway: res.data.activeGateway,
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
    setIsSaving(true);
    try {
      await apiClient.put('store-admin/payment-settings', {
        activeGateway: form.activeGateway,
        stripeSecretKey: form.stripeSecretKey || null,
        stripePublishableKey: form.stripePublishableKey || null,
        stripeWebhookSecret: form.stripeWebhookSecret || null,
        iyzipayApiKey: form.iyzipayApiKey || null,
        iyzipaySecretKey: form.iyzipaySecretKey || null,
        iyzipayBaseUrl: form.iyzipayBaseUrl || null,
      });
      toast.success('Ödeme ayarları kaydedildi.');
      setForm(f => ({
        ...f,
        stripeSecretKey: '',
        stripeWebhookSecret: '',
        iyzipayApiKey: '',
        iyzipaySecretKey: '',
      }));
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
    <div className={ps.fieldGroup}>
      <label className={ps.fieldLabel}>{label}</label>
      {hasValue && !(form[field] as string) && (
        <div className={ps.savedRow}>
          <span className={ps.savedBadge}>Kayıtlı</span>
          <span className={ps.hint}>{hint}</span>
          <button
            type="button"
            className={ps.changeBtn}
            onClick={() => setForm(f => ({ ...f, [field]: ' ' }))}
          >
            Değiştir
          </button>
        </div>
      )}
      {(!hasValue || (form[field] as string)) && (
        <div className={ps.inputRow}>
          <Input
            type={visible[field] ? 'text' : 'password'}
            value={(form[field] as string).trim() === '' ? '' : form[field] as string}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            placeholder={hasValue ? 'Yeni değer girin (boş bırakırsanız mevcut korunur)' : 'API key girin'}
          />
          <button type="button" className={ps.eyeBtn} onClick={() => toggle(field)}>
            {visible[field] ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      )}
    </div>
  );

  const gateway = form.activeGateway;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaCreditCard className={s.titleIcon} />
          <div>
            <h1 className={s.pageTitle}>Ödeme Entegrasyonu</h1>
            <p className={s.pageSubtitle}>
              Gateway seçin ve API anahtarlarınızı girin. Anahtarlar şifreli saklanır.
            </p>
          </div>
        </div>
      </div>

      <div className={ps.gatewaySelect}>
        <label className={ps.fieldLabel}>Aktif Gateway</label>
        <Select
          value={gateway}
          onChange={e => setForm(f => ({ ...f, activeGateway: String(e) }))}
          options={GATEWAY_OPTIONS}
        />
        {gateway === 'platform_default' && (
          <p className={ps.infoNote}>
            Platform varsayılanı seçiliyken Super Admin'in tanımladığı API anahtarları kullanılır.
          </p>
        )}
      </div>

      {gateway !== 'platform_default' && (
        <div className={ps.cards}>
          {gateway === 'stripe' && (
            <div className={ps.card}>
              <div className={ps.cardHead}>
                <SiStripe className={ps.stripeIcon} />
                <span>Stripe Ayarları</span>
              </div>
              <div className={ps.cardBody}>
                <SecretInput
                  field="stripeSecretKey"
                  label="Secret Key (sk_live_... / sk_test_...)"
                  hint={current?.stripeSecretKeyHint ?? null}
                  hasValue={current?.hasStripeSecretKey ?? false}
                />
                <div className={ps.fieldGroup}>
                  <label className={ps.fieldLabel}>Publishable Key (pk_...)</label>
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
          )}

          {gateway === 'iyzipay' && (
            <div className={ps.card}>
              <div className={ps.cardHead}>
                <FaCreditCard className={ps.iyzipayIcon} />
                <span>Iyzipay Ayarları</span>
              </div>
              <div className={ps.cardBody}>
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
                <div className={ps.fieldGroup}>
                  <label className={ps.fieldLabel}>Base URL</label>
                  <Input
                    value={form.iyzipayBaseUrl}
                    onChange={e => setForm(f => ({ ...f, iyzipayBaseUrl: e.target.value }))}
                    placeholder="https://sandbox-api.iyzipay.com"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={ps.actions}>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          <FaSave style={{ marginRight: 6 }} />
          Kaydet
        </Button>
      </div>
    </div>
  );
};

export default StorePaymentSettingsPage;
