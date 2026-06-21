import { create } from 'zustand';
import { storage } from '../services/storage';
import { authService } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  schoolId: string | null;
  photo?: string;
  school?: { id: string; name: string; logo?: string };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isLoggedIn: false,

  login: async (email, password) => {
    const res = await authService.login(email, password);
    const { token, user } = res.data.data;
    await storage.setItem('authToken', token);
    set({ user, token, isLoggedIn: true });
  },

  logout: async () => {
    await storage.deleteItem('authToken');
    set({ user: null, token: null, isLoggedIn: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await storage.getItem('authToken');
      if (token) {
        const res = await authService.getMe();
        set({ user: res.data.data, token, isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await storage.deleteItem('authToken');
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const res = await authService.getMe();
      set({ user: res.data.data });
    } catch {}
  },
}));
