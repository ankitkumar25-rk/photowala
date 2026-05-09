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
      setUser: (user) => set({ user }),
      logout: () => { set({ user: null }); adminFetchMePromise = null; },
      
      fetchMe: async () => {
        // Prevent concurrent fetchMe calls
        if (adminFetchMePromise) return adminFetchMePromise;
        
        set({ isFetching: true });
        adminFetchMePromise = (async () => {
          try {
            const { data } = await api.get('/auth/me');
            if (!['ADMIN', 'SUPER_ADMIN'].includes(data?.data?.role)) {
              throw new Error('Admin role required');
            }
            set({ user: data.data, isFetching: false });
            return data.data;
          } catch (err) {
            set({ user: null, isFetching: false });
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
        getItem: (name) => sessionStorage.getItem(name),
        setItem: (name, value) => sessionStorage.setItem(name, value),
        removeItem: (name) => sessionStorage.removeItem(name),
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
  const isFetching = useAdminStore((s) => s.isFetching);

  // Show loader only if actively fetching, not if user is simply not logged in
  if (isFetching && !user) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    // Initial auth check on app mount (handles Google OAuth callback and page refresh)
    useAdminStore.getState().fetchMe().catch((err) => {
      console.error('Initial auth check failed:', err);
    });
  }, []); // Empty array: run only once on mount

  useEffect(() => {
    const readCookie = (name) => {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
    };

    const logoutOnExit = () => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
      const csrf = readCookie('csrf_token');
      fetch(`${baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        },
      }).catch(() => {});
      useAdminStore.setState({ user: null });
      localStorage.removeItem('admin-auth');
    };

    // Removed aggressive logout on exit to prevent accidental logouts when switching tabs
    // window.addEventListener('beforeunload', logoutOnExit);
    // return () => window.removeEventListener('beforeunload', logoutOnExit);
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

            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
