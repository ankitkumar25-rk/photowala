import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, cartApi } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          set({ user: data.data.user, isLoading: false });
          // Merge guest cart into user cart
          await cartApi.merge().catch(() => {});
          await useCartStore.getState().fetchCart();
          // Optionally fetch full user profile to get avatarUrl, phone etc.
          // (non-critical, can wait for next fetchMe)
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(userData);
          set({ user: data.data.user, isLoading: false });
          await cartApi.merge().catch(() => {});
          await useCartStore.getState().fetchCart();
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authApi.logout().catch(() => {});
        set({ user: null });
        useCartStore.getState().resetCart();
      },

      fetchMe: async () => {
        const hadUserBefore = !!get().user; // Capture state before request
        try {
          const { data } = await authApi.getMe();
          // Prevent admin leakage: only allow USER role in the store frontend
          if (data.data?.role !== 'USER') {
            console.warn('[Auth] Non-USER role detected:', data.data?.role);
            set({ user: null });
            useCartStore.getState().resetCart();
            return null;
          }
          set({ user: data.data });
          await useCartStore.getState().fetchCart();
          return data.data;
        } catch (err) {
          // Only clear user if we previously thought we were authenticated
          // (prevents race condition where initial fetchMe overwrites fresh login)
          if (hadUserBefore) {
            console.error('[Auth] fetchMe failed, clearing user', err);
            set({ user: null });
            useCartStore.getState().resetCart();
          }
          throw err;
        }
      },

      isAuthenticated: () => !!get().user,
      isAdmin: () => ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    const authState = useAuthStore.getState();
    if (!authState.user) {
      set({ items: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({ items: data.data?.items || [], isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

   addItem: async (productId, quantity = 1, customization = {}) => {
     await cartApi.add({ productId, quantity, ...customization });
     await get().fetchCart();
   },

   updateItem: async (productId, quantity) => {
     await cartApi.update({ productId, quantity });
     await get().fetchCart();
   },

   removeItem: async (productId) => {
     await cartApi.remove({ productId });
     await get().fetchCart();
   },

  clearCart: async () => {
    await cartApi.clear();
    set({ items: [] });
  },

  resetCart: () => {
    set({ items: [], isLoading: false });
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal:  () => get().items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
}));
