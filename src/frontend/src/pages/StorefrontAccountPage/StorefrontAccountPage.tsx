import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import sfClient, { setSfTenant } from '../../shared/api/storefrontApiClient';
import { useCustomerStore } from '../../entities/Customer/model/store';
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
  const { customer, logout } = useCustomerStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);

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
          <h2 className={styles.sectionTitle}>Profil Bilgileri</h2>
          {customer && (
            <div className={styles.profileGrid}>
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
