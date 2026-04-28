import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface StoreState {
  // Cart State
  cart: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Auth State
  customer: Customer | null;
  token: string | null;
  setAuth: (customer: Customer, token: string) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Cart Initial State
      cart: [],
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      
      addItem: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),

      removeItem: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      })),

      clearCart: () => set({ cart: [] }),

      // Auth Initial State
      customer: null,
      token: null,
      setAuth: (customer, token) => set({ customer, token }),
      logout: () => set({ customer: null, token: null }),
    }),
    {
      name: 'wixi-store-storage',
      partialize: (state) => ({ cart: state.cart, customer: state.customer, token: state.token }),
    }
  )
);
