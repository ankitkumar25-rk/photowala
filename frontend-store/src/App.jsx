import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { useAuthStore, useCartStore } from './store';
import Layout from './components/Layout';
import { brandAssets } from './data/assets';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { WishlistProvider } from './contexts/WishlistContext';

// Pages (lazy loaded)
import { lazy, Suspense } from 'react';
const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Orders        = lazy(() => import('./pages/Orders'));
const OrderDetail   = lazy(() => import('./pages/OrderDetail'));
const Account       = lazy(() => import('./pages/Account'));
const Wishlist      = lazy(() => import('./pages/Wishlist'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Category      = lazy(() => import('./pages/Category'));
const AuthSuccess   = lazy(() => import('./pages/AuthSuccess'));
const TrackOrder    = lazy(() => import('./pages/TrackOrder'));
const Returns       = lazy(() => import('./pages/Returns'));
const FAQ           = lazy(() => import('./pages/FAQ'));
const Privacy       = lazy(() => import('./pages/Privacy'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const Services      = lazy(() => import('./pages/Services'));
const PaperGsmCalculator = lazy(() => import('./pages/PaperGsmCalculator'));
const CustomPrintingIndex = lazy(() => import('./pages/services/CustomPrinting/CustomPrintingIndex'));
const PenIndex = lazy(() => import('./pages/services/CustomPrinting/Pen/PenIndex'));
const LaserPrintedPen = lazy(() => import('./pages/services/CustomPrinting/Pen/LaserPrintedPen'));
const NotFound      = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="flex flex-col items-center gap-4">
        <img src={brandAssets.logo} alt="Loading..." className="h-12 w-auto animate-pulse" />
        <p className="text-brand-primary font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Initial auth check on app mount
    useAuthStore.getState().fetchMe().catch((err) => {
      // Errors are already handled inside fetchMe (user cleared if previously authenticated)
      // This catch just logs unexpected errors
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
      useAuthStore.setState({ user: null, isLoading: false });
      useCartStore.getState().resetCart();
      localStorage.removeItem('auth-storage');
    };

    window.addEventListener('beforeunload', logoutOnExit);
    return () => window.removeEventListener('beforeunload', logoutOnExit);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WishlistProvider>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '14px', border: '1px solid #efd3c1', background: '#fffdfb', color: '#2e211c' },
              success: { style: { background: '#f1ffe9', color: '#36521f', border: '1px solid #b7d894' } },
              error:   { style: { background: '#fff1ef', color: '#8f2d1d', border: '1px solid #f0b6aa' } },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index                element={<Home />} />
                <Route path="products"      element={<Products />} />
                <Route path="products/:slug" element={<ProductDetail />} />
                <Route path="categories/:slug" element={<Category />} />
                <Route path="cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="login"         element={<Login />} />
                <Route path="register"      element={<Register />} />

                {/* Protected Routes */}
                <Route path="checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="orders"    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="account"   element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="wishlist"  element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                {/* Auth flow routes */}
                <Route path="auth/success"     element={<AuthSuccess />} />
                <Route path="track-order"      element={<TrackOrder />} />
                <Route path="returns"          element={<Returns />} />
                <Route path="faq"              element={<FAQ />} />
                <Route path="services"         element={<Services />} />
                <Route path="services/paper-gsm" element={<PaperGsmCalculator />} />
                <Route path="services/custom-printing" element={<CustomPrintingIndex />} />
                <Route path="services/custom-printing/pen" element={<PenIndex />} />
                <Route path="services/custom-printing/pen/laser-printed-pen" element={<LaserPrintedPen />} />
                <Route path="privacy"          element={<Privacy />} />
                <Route path="forgot-password"  element={<ForgotPassword />} />
                <Route path="reset-password"   element={<ResetPassword />} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </WishlistProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
