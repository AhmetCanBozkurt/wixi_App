import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../entities/Cart/model/store';
import styles from './CartBadge.module.css';

interface CartBadgeProps {
  tenantSlug: string;
}

export const CartBadge = ({ tenantSlug }: CartBadgeProps) => {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  return (
    <button
      className={styles.badge}
      onClick={() => navigate(`/store/${tenantSlug}/cart`)}
      aria-label="Sepet"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {totalItems > 0 && (
        <span className={styles.count}>{totalItems > 99 ? '99+' : totalItems}</span>
      )}
    </button>
  );
};
