import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api/client';

// ── Auth Store ───────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
let adminFetchMePromise = null;
export const useAdminStore = create(
  persist(
    (set, get) => ({
      user: null,
      isFetching: false,
      isInitialized: false, // Added to track if initial auth check is done
      
      setUser: (user) => set({ user }),
      logout: () => { 
        set({ user: null, isInitialized: true }); 
        adminFetchMePromise = null; 
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin-auth');
      },
      
      fetchMe: async () => {
        // Prevent concurrent fetchMe calls
        if (adminFetchMePromise) return adminFetchMePromise;
        
        set({ isFetching: true });
        adminFetchMePromise = (async () => {
          try {
            const response = await api.get('/auth/me');
            const { data } = response;
            
            // Extract user from correct response structure
            const userData = data?.data?.user || data?.data;
            
            if (!['ADMIN', 'SUPER_ADMIN'].includes(userData?.role)) {
              throw new Error('Admin role required');
            }
            set({ user: userData, isFetching: false, isInitialized: true });
            return userData;
          } catch (err) {
            set({ user: null, isFetching: false, isInitialized: true });
            throw err;
          } finally {
            adminFetchMePromise = null;
          }
        })();
        return adminFetchMePromise;
      },
    }),
    { 
      name: 'admin-auth', 
      storage: {
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (s) => ({ user: s.user }) 
    }
  )
);

// ── Pages ────────────────────────────────────────────────────
const AdminLogin      = lazy(() => import('./pages/AdminLogin'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const AdminProducts   = lazy(() => import('./pages/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/AdminProductForm'));
const AdminOrders     = lazy(() => import('./pages/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/AdminOrderDetail'));
const AdminCustomers  = lazy(() => import('./pages/AdminCustomers'));
const AdminCustomerDetail = lazy(() => import('./pages/AdminCustomerDetail'));
const AdminReturns    = lazy(() => import('./pages/AdminReturns'));
const AdminInventory  = lazy(() => import('./pages/AdminInventory'));
const AdminSupport    = lazy(() => import('./pages/AdminSupport'));

// Service Orders
const MachineOrders   = lazy(() => import('./pages/services/MachineOrders'));
const PrintOrders     = lazy(() => import('./pages/services/PrintOrders'));
const ServiceOrderDetail = lazy(() => import('./pages/services/ServiceOrderDetail'));

const AdminLayout = lazy(() => import('./components/AdminLayout'));

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 2 * 60 * 1000, retry: 1 } } });

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-gray-500 font-medium">Loading admin...</p>
      </div>
    </div>
  );
}

function RequireAdmin({ children }) {
  const user = useAdminStore((s) => s.user);
  const isInitialized = useAdminStore((s) => s.isInitialized);

  // MUST wait for initialization (initial fetchMe) to complete
  if (!isInitialized) return <Loader />;
  
  // If check is done and no user, or user is not admin, redirect
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Authorized
  return children;
}

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      useAdminStore.getState().fetchMe().catch((err) => {
        console.error('Initial auth check failed:', err);
      });
    } else {
      useAdminStore.setState({ isInitialized: true });
    }
  }, []);

  useEffect(() => {
    // Proactive silent refresh every 13 minutes
    const refreshSilently = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
        const res = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data?.data || {};
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        }
      } catch (err) {
        console.error('Silent refresh failed:', err);
      }
    };

    const interval = setInterval(refreshSilently, 13 * 60 * 1000);
    
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('token');
        const user = useAdminStore.getState().user;
        // Only fetch if we have a token but no user (lost state)
        if (token && !user) {
          useAdminStore.getState().fetchMe().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px', fontSize: '14px' } }} />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index              element={<Dashboard />} />
              <Route path="products"    element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/id/:id/edit" element={<AdminProductForm />} />
              <Route path="products/:slug/edit" element={<AdminProductForm />} />
              <Route path="orders"      element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="customers"   element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomerDetail />} />
              <Route path="returns"     element={<AdminReturns />} />
              <Route path="inventory"   element={<AdminInventory />} />
              <Route path="support"     element={<AdminSupport />} />
              
              {/* Service Orders */}
              <Route path="machine-orders" element={<MachineOrders />} />
              <Route path="print-orders"   element={<PrintOrders />} />
              <Route path="services/orders/:id" element={<ServiceOrderDetail />} />

            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
