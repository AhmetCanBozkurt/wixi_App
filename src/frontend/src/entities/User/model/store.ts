import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token: string) => {
    localStorage.setItem('token', token);
    try {
      const decoded: any = jwtDecode(token);
      
      const user: User = {
        id: decoded.nameid || decoded.sub || '',
        email: decoded.email || '',
        firstName: '', 
        lastName: '',
        roles: Array.isArray(decoded.role) ? decoded.role : (decoded.role ? [decoded.role] : [])
      };

      set({ token, user, isAuthenticated: true });
    } catch (e) {
      set({ token, user: null, isAuthenticated: true });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));

// Mount olduğu an eğer varsa localStorage'daki jwt'yi hydrate et:
const initialToken = localStorage.getItem('token');
if (initialToken) {
  useAuthStore.getState().login(initialToken);
}
