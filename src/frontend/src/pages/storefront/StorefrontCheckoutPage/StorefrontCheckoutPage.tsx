import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import sfClient, { setSfTenant } from '../../../shared/api/storefrontApiClient';
import { useCartStore } from '../../../entities/Cart/model/store';
import styles from './StorefrontCheckoutPage.module.css';

interface CheckoutForm {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  sameAsBilling: boolean;
}

export const StorefrontCheckoutPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Türkiye',
    sameAsBilling: true,
  });

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const buildAddress = () =>
    `${form.fullName}, ${form.address}, ${form.city} ${form.postalCode}, ${form.country}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug || items.length === 0) return;
    setIsLoading(true);
    setSfTenant(tenantSlug);
    try {
      const shippingAddress = buildAddress();
      const res = await sfClient.post<{ orderId: string; orderNumber: string }>(
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
      await clearCart(tenantSlug);
      navigate(`/store/${tenantSlug}/order-success/${res.data.orderNumber}`);
    } catch {
      toast.error('Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Sipariş Ver</h1>
        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.sectionTitle}>Teslimat Adresi</h2>
            <div className={styles.field}>
              <label className={styles.label}>Ad Soyad</label>
              <input type="text" name="fullName" className={styles.input} value={form.fullName} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Adres</label>
              <input type="text" name="address" className={styles.input} value={form.address} onChange={handleChange} required />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Şehir</label>
                <input type="text" name="city" className={styles.input} value={form.city} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Posta Kodu</label>
                <input type="text" name="postalCode" className={styles.input} value={form.postalCode} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ülke</label>
              <input type="text" name="country" className={styles.input} value={form.country} onChange={handleChange} required />
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="sameAsBilling" checked={form.sameAsBilling} onChange={handleChange} />
              Fatura adresi teslimat adresi ile aynı
            </label>
            <button type="submit" className={styles.submitBtn} disabled={isLoading || items.length === 0}>
              {isLoading ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla'}
            </button>
          </form>

          <div className={styles.summary}>
            <h2 className={styles.sectionTitle}>Sipariş Özeti</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span className={styles.itemName}>{item.productName}{item.variantName ? ` (${item.variantName})` : ''} x{item.quantity}</span>
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
