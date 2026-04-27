import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, cartApi } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('access_token', token);
        set({ accessToken: token });
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          set({ user: data.data.user, accessToken: data.data.accessToken, isLoading: false });
          localStorage.setItem('access_token', data.data.accessToken);
          // Merge guest cart into user cart
          cartApi.merge().catch(() => {});
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
          set({ user: data.data.user, accessToken: data.data.accessToken, isLoading: false });
          localStorage.setItem('access_token', data.data.accessToken);
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authApi.logout().catch(() => {});
        localStorage.removeItem('access_token');
        set({ user: null, accessToken: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data });
        } catch {
          set({ user: null, accessToken: null });
          localStorage.removeItem('access_token');
        }
      },

      isAuthenticated: () => !!get().user,
      isAdmin: () => ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {

    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({ items: data.data?.items || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await cartApi.add({ productId, quantity });
    get().fetchCart();
  },

  updateItem: async (productId, quantity) => {
    await cartApi.update({ productId, quantity });
    get().fetchCart();
  },

  removeItem: async (productId) => {
    await cartApi.remove({ productId });
    get().fetchCart();
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ items: [] });
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal:  () => get().items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
}));
