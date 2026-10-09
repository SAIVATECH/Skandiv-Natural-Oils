import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  whatsappNumber: string;
  role: 'ADMIN' | 'CUSTOMER';
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user: AuthUser) => {
        if (typeof window !== 'undefined') {
          if (user.role === 'ADMIN') {
            localStorage.setItem('isAdminAuthenticated', 'true');
          }
        }
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAdminAuthenticated');
        }
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (data: Partial<AuthUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'skandiv_auth_session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
