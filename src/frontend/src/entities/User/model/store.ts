import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User } from './types';
import { apiClient } from '../../../shared/api/axiosConfig';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (token: string) => {
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
      
      // Perform full profile hydration
      await get().fetchMe();
    } catch (e) {
      set({ token, user: null, isAuthenticated: true });
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await apiClient.get<any>('auth/me');
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { 
            ...currentUser, 
            firstName: res.data.firstName, 
            lastName: res.data.lastName,
            profilePicture: res.data.profilePicture
          } 
        });
      }
    } catch (e) {
      console.error("Failed to fetch user profile", e);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));

// Hydrate on initial load
const initialToken = localStorage.getItem('token');
if (initialToken) {
  useAuthStore.getState().login(initialToken);
}
