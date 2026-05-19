import { create } from 'zustand';
import sfClient, { setSfTenant } from '../../../shared/api/storefrontApiClient';
import type { CartItem } from './types';

interface AddItemInput {
  productId: string;
  variantId?: string;
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  fetchCart: (tenantSlug: string) => Promise<void>;
  addItem: (tenantSlug: string, input: AddItemInput) => Promise<void>;
  updateItem: (tenantSlug: string, id: string, quantity: number) => Promise<void>;
  removeItem: (tenantSlug: string, id: string) => Promise<void>;
  clearCart: (tenantSlug: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
  get totalPrice() {
    return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  fetchCart: async (tenantSlug) => {
    setSfTenant(tenantSlug);
    set({ isLoading: true });
    try {
      const res = await sfClient.get<CartItem[]>('/public/storefront/cart');
      set({ items: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (tenantSlug, input) => {
    setSfTenant(tenantSlug);
    await sfClient.post('/public/storefront/cart/items', {
      productId: input.productId,
      variantId: input.variantId ?? null,
      quantity: input.quantity ?? 1,
    });
    await get().fetchCart(tenantSlug);
  },

  updateItem: async (tenantSlug, id, quantity) => {
    setSfTenant(tenantSlug);
    await sfClient.put(`/public/storefront/cart/items/${id}`, { quantity });
    await get().fetchCart(tenantSlug);
  },

  removeItem: async (tenantSlug, id) => {
    setSfTenant(tenantSlug);
    await sfClient.delete(`/public/storefront/cart/items/${id}`);
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clearCart: async (tenantSlug) => {
    setSfTenant(tenantSlug);
    await sfClient.delete('/public/storefront/cart');
    set({ items: [] });
  },
}));
