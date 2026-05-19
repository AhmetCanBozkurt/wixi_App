import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import sfClient, { setSfTenant } from '../../shared/api/storefrontApiClient';
import { useCustomerStore } from '../../entities/Customer/model/store';
import { customerApi } from '../../entities/Customer/api/customerApi';
import styles from './StorefrontAccountPage.module.css';

interface OrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const StorefrontAccountPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { customer, logout, updateCustomer } = useCustomerStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantSlug) return;
    setSfTenant(tenantSlug);
    sfClient.get<OrderSummary[]>('/public/storefront/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => {});
  }, [tenantSlug]);

  const handleLogout = () => {
    if (tenantSlug) {
      logout(tenantSlug);
      navigate(`/store/${tenantSlug}/login`);
    }
  };

  const handleEditStart = () => {
    if (customer) {
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setPhoneNumber(customer.phoneNumber ?? '');
    }
    setSaveError(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!tenantSlug) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await customerApi.updateProfile(tenantSlug, {
        firstName,
        lastName,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      updateCustomer(
        { firstName, lastName, phoneNumber: phoneNumber.trim() || undefined },
        tenantSlug
      );
      setIsEditing(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setSaveError(axiosErr?.response?.data?.error ?? 'Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'Bekliyor',
      Paid: 'Ödendi',
      Processing: 'İşleniyor',
      Shipped: 'Kargoya Verildi',
      Delivered: 'Teslim Edildi',
      Cancelled: 'İptal Edildi',
      Refunded: 'İade Edildi',
    };
    return map[status] ?? status;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Hesabım</h1>
            {customer && (
              <p className={styles.welcome}>Merhaba, {customer.firstName} {customer.lastName}!</p>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profil Bilgileri</h2>
            {!isEditing && (
              <button className={styles.editBtn} onClick={handleEditStart}>
                Düzenle
              </button>
            )}
          </div>

          {customer && (
            isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Ad</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Adınız"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Soyad</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Soyadınız"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>E-posta</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={customer.email}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Telefon</label>
                  <input
                    className={styles.formInput}
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Telefon numaranız (isteğe bağlı)"
                  />
                </div>
                {saveError && <p className={styles.saveError}>{saveError}</p>}
                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleEditCancel}
                    disabled={isSaving}
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.profileGrid}>
                <div>
                  <span className={styles.fieldLabel}>Ad Soyad</span>
                  <span className={styles.fieldValue}>{customer.firstName} {customer.lastName}</span>
                </div>
                <div>
                  <span className={styles.fieldLabel}>E-posta</span>
                  <span className={styles.fieldValue}>{customer.email}</span>
                </div>
                {customer.phoneNumber && (
                  <div>
                    <span className={styles.fieldLabel}>Telefon</span>
                    <span className={styles.fieldValue}>{customer.phoneNumber}</span>
                  </div>
                )}
              </div>
            )
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sipariş Geçmişi</h2>
          {orders.length === 0 ? (
            <p className={styles.empty}>Henüz siparişiniz bulunmuyor.</p>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/store/${tenantSlug}/orders/${order.orderNumber}`}
                  className={styles.orderCard}
                >
                  <div>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderStatus}>{statusLabel(order.status)}</span>
                    <span className={styles.orderAmount}>
                      ₺{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
