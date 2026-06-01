import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import sfClient, { setSfTenant } from '../../../shared/api/storefrontApiClient';
import { useCartStore } from '../../../entities/Cart/model/store';
import styles from './StorefrontCheckoutPage.module.css';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  sameAsBilling: boolean;
}

export const StorefrontCheckoutPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { items, clearCart } = useCartStore();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const iyzipayRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Türkiye',
    sameAsBilling: true,
  });

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const buildAddress = () =>
    `${form.firstName} ${form.lastName}, ${form.address}, ${form.city} ${form.postalCode}, ${form.country}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug || items.length === 0) return;
    setIsLoading(true);
    setSfTenant(tenantSlug);
    try {
      const shippingAddress = buildAddress();

      // Adım 1: Sipariş oluştur
      const orderRes = await sfClient.post<{ orderId: string; orderNumber: string }>(
        '/public/storefront/orders',
        {
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
          })),
          shippingAddress,
          billingAddress: form.sameAsBilling ? shippingAddress : buildAddress(),
          currency: 'TRY',
        }
      );

      const newOrderId = orderRes.data.orderId;

      // Adım 2: Ödeme başlat
      const paymentRes = await sfClient.post<{ token: string; checkoutFormContent: string }>(
        '/public/storefront/payment/initiate',
        {
          orderId: newOrderId,
          buyerName: form.firstName,
          buyerSurname: form.lastName,
          buyerEmail: form.email,
          buyerPhone: form.phone || undefined,
          callbackUrl: '',
        }
      );

      await clearCart(tenantSlug);
      setOrderId(newOrderId);
      setCheckoutHtml(paymentRes.data.checkoutFormContent);
      setPaymentToken(paymentRes.data.token);
      setStep('payment');
    } catch {
      toast.error('Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Iyzipay iframe HTML'ini DOM'a inject et ve script'leri çalıştır
  useEffect(() => {
    if (step === 'payment' && checkoutHtml && iyzipayRef.current) {
      iyzipayRef.current.innerHTML = checkoutHtml;
      const scripts = iyzipayRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        newScript.text = oldScript.text;
        if (oldScript.src) newScript.src = oldScript.src;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [step, checkoutHtml]);

  // Kullanılmayan değişken uyarısını engellemek için
  void orderId;
  void paymentToken;

  if (step === 'payment') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stepIndicator}>
            <span>Adres</span>
            <span>›</span>
            <span className={styles.stepActive}>Ödeme</span>
          </div>
          <h1 className={styles.title}>Ödeme</h1>
          <div className={styles.iyzipayContainer} ref={iyzipayRef} />
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => setStep('address')}
          >
            ← Adrese Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.stepIndicator}>
          <span className={styles.stepActive}>Adres</span>
          <span>›</span>
          <span>Ödeme</span>
        </div>
        <h1 className={styles.title}>Sipariş Ver</h1>
        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.sectionTitle}>Teslimat Adresi</h2>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Ad</label>
                <input
                  type="text"
                  name="firstName"
                  className={styles.input}
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  className={styles.input}
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>E-posta</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Telefon (opsiyonel)</label>
              <input
                type="tel"
                name="phone"
                className={styles.input}
                value={form.phone}
                onChange={handleChange}
                placeholder="+905XXXXXXXXX"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Adres</label>
              <input
                type="text"
                name="address"
                className={styles.input}
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Şehir</label>
                <input
                  type="text"
                  name="city"
                  className={styles.input}
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Posta Kodu</label>
                <input
                  type="text"
                  name="postalCode"
                  className={styles.input}
                  value={form.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ülke</label>
              <input
                type="text"
                name="country"
                className={styles.input}
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="sameAsBilling"
                checked={form.sameAsBilling}
                onChange={handleChange}
              />
              Fatura adresi teslimat adresi ile aynı
            </label>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || items.length === 0}
            >
              {isLoading ? 'Yükleniyor...' : 'Ödemeye Geç →'}
            </button>
          </form>

          <div className={styles.summary}>
            <h2 className={styles.sectionTitle}>Sipariş Özeti</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span className={styles.itemName}>
                  {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ''} x{item.quantity}
                </span>
                <span>₺{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span>Toplam</span>
              <span className={styles.totalAmount}>₺{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

