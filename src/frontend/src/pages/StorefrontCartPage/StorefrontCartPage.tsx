import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCartStore } from '../../entities/Cart/model/store';
import { useCustomerStore } from '../../entities/Customer/model/store';
import styles from './StorefrontCartPage.module.css';

export const StorefrontCartPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { items, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated, hydrate } = useCustomerStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (tenantSlug) hydrate(tenantSlug);
  }, [tenantSlug, hydrate]);

  useEffect(() => {
    if (tenantSlug && isAuthenticated) {
      void fetchCart(tenantSlug);
    }
  }, [tenantSlug, isAuthenticated, fetchCart]);

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p>Sepetinizi görüntülemek için giriş yapmanız gerekiyor.</p>
          <Link to={`/store/${tenantSlug}/login`} className={styles.loginBtn}>Giriş Yap</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.page}><p className={styles.loading}>Yükleniyor...</p></div>;
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h2>Sepetiniz Boş</h2>
          <p>Alışverişe başlamak için ürünleri inceleyin.</p>
          <Link to={`/store/${tenantSlug}`} className={styles.loginBtn}>Alışverişe Başla</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Sepetim</h1>
        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} />
                    : <div className={styles.imgPlaceholder} />
                  }
                </div>
                <div className={styles.itemDetails}>
                  <Link
                    to={`/store/${tenantSlug}/product/${item.productSlug}`}
                    className={styles.itemName}
                  >
                    {item.productName}
                  </Link>
                  {item.variantName && <p className={styles.itemVariant}>{item.variantName}</p>}
                  <p className={styles.itemPrice}>₺{item.unitPrice.toFixed(2)}</p>
                </div>
                <div className={styles.itemQty}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => tenantSlug && void updateItem(tenantSlug, item.id, item.quantity - 1)}
                  >-</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => tenantSlug && void updateItem(tenantSlug, item.id, item.quantity + 1)}
                  >+</button>
                </div>
                <div className={styles.itemTotal}>₺{item.totalPrice.toFixed(2)}</div>
                <button
                  className={styles.removeBtn}
                  onClick={() => tenantSlug && void removeItem(tenantSlug, item.id)}
                  aria-label="Sil"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Sipariş Özeti</h3>
            <div className={styles.summaryRow}>
              <span>Ara Toplam</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Toplam</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => navigate(`/store/${tenantSlug}/checkout`)}
            >
              Ödemeye Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
