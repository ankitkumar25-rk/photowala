import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],      // array of notification objects
      unreadCount: 0,         // badge number
      isConnected: false,     // SSE connection status

      addNotification: (notification) => set((state) => ({
        notifications: [
          { 
            ...notification, 
            _id: Date.now(),
            read: false,
            receivedAt: new Date().toISOString(),
          },
          ...state.notifications,
        ].slice(0, 50), // keep max 50 notifications
        unreadCount: state.unreadCount + 1,
      })),

      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      markOneRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      setConnected: (status) => set({ isConnected: status }),
    }),
    {
      name: 'photowala-admin-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        // Don't persist isConnected (runtime only)
      }),
    }
  )
);
