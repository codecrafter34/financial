import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      viewAsRole: null,
      
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          viewAsRole: null,
        });
      },
      
      setViewAsRole: (role) => {
        const { user } = get();
        if (user?.role === 'ADMIN') {
          set({ viewAsRole: role });
        }
      },
      
      getEffectiveRole: () => {
        const { user, viewAsRole } = get();
        if (!user) return null;
        if (user.role === 'ADMIN' && viewAsRole) {
          return viewAsRole;
        }
        return user.role;
      },
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// API client helper
export function getAuthHeaders() {
  const { token, viewAsRole } = useAuthStore.getState();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  
  if (viewAsRole) {
    headers['X-View-As-Role'] = viewAsRole;
  }
  
  return headers;
}
