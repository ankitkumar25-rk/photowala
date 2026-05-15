import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, cartApi } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false, // Added tracking
      isHydrating: true, // NEW: True while checking auth on initial load
      _fetchMePromise: null, 

      setUser: (user) => set({ user }),
      finishInitialization: () => set({ isInitialized: true, isHydrating: false }),
      login: async (credentials) => {
        set({ isLoading: true, isHydrating: false });
        try {
          const response = await authApi.login(credentials);
          const { data } = response;
          
          const userData = data?.data?.user || data?.user || data?.data;
          
          if (!userData) {
            throw new Error('Invalid response format: missing user data');
          }
          
          set({ user: userData, isLoading: false, isInitialized: true, isHydrating: false });
          await cartApi.merge().catch(() => {});
          await useCartStore.getState().fetchCart();
          return response.data;
        } catch (err) {
          set({ isLoading: false, isHydrating: false });
          throw err;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, isHydrating: false });
        try {
          const response = await authApi.register(userData);
          const { data } = response;
          
          const userObj = data?.data?.user || data?.user || data?.data;
          
          if (!userObj) {
            throw new Error('Invalid response format: missing user data');
          }
          
          set({ user: userObj, isLoading: false, isInitialized: true, isHydrating: false });
          await cartApi.merge().catch(() => {});
          await useCartStore.getState().fetchCart();
          return response.data;
        } catch (err) {
          set({ isLoading: false, isHydrating: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout().catch(() => {});
        } finally {
          localStorage.removeItem('auth-storage');
          set({ user: null, _fetchMePromise: null, isInitialized: true, isHydrating: false });
          useCartStore.getState().resetCart();
        }
      },

      fetchMe: async () => {
        if (get()._fetchMePromise) return get()._fetchMePromise;
        
        const hadUserBefore = !!get().user;
        const promise = (async () => {
          try {
            const response = await authApi.getMe();
            const { data } = response;
            const userData = data?.data?.user || data?.user || data?.data;
            
            const allowedRoles = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];
            if (!userData || !userData.role || !allowedRoles.includes(userData.role)) {
              set({ user: null, _fetchMePromise: null, isInitialized: true, isHydrating: false });
              useCartStore.getState().resetCart();
              return null;
            }
            set({ user: userData, _fetchMePromise: null, isInitialized: true, isHydrating: false });
            await useCartStore.getState().fetchCart();
            return userData;
          } catch (err) {
            if (hadUserBefore) {
              set({ user: null, _fetchMePromise: null, isInitialized: true, isHydrating: false });
              useCartStore.getState().resetCart();
            } else {
              set({ _fetchMePromise: null, isInitialized: true, isHydrating: false });
            }
            throw err;
          }
        })();
        
        set({ _fetchMePromise: promise });
        return promise;
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
