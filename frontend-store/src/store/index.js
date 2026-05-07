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
        try {
          const { data } = await authApi.getMe();
          // Prevent admin leakage: only allow USER role in the store frontend
          if (data.data.role !== 'USER') {
            set({ user: null });
            useCartStore.getState().resetCart();
            return null;
          }
          set({ user: data.data });
          await useCartStore.getState().fetchCart();
          return data.data;
        } catch (err) {
          set({ user: null });
          useCartStore.getState().resetCart();
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
