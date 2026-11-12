import React, { useEffect, Suspense, lazy, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CommandMenu from './components/ui/CommandMenu';
import RouteErrorBoundary from './components/ui/RouteErrorBoundary';

import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { DeviceProvider } from './context/DeviceContext';
import { CustomerAIProfileProvider } from './context/CustomerAIProfile';
import ErrorBoundary from './components/ErrorBoundary';

// ── Layer 1: The Senses (GTM Frontend Tracking) ──
import API_BASE_URL from './config/api';
import { initGTM, pushEvent } from './lib/gtm';
import { initFbq, fbqEvent } from './lib/fbq';
import { appConfig } from './config/app';
import { resolveImageUrl } from './utils/imageUrl';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CustomerLayout from './components/CustomerLayout';

const Shop = lazy(() => import('./pages/Shop'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const CustomerRegister = lazy(() => import('./pages/CustomerRegister'));
const Profile = lazy(() => import('./pages/Profile'));
const CustomerOrders = lazy(() => import('./pages/CustomerOrders'));
const CustomerTrackOrder = lazy(() => import('./pages/CustomerTrackOrder'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResolutionCenter = lazy(() => import('./pages/ResolutionCenter'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-t-base">
    <div className="w-8 h-8 border-4 border-t-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const CustomerProtectedRoute = () => {
  const token = localStorage.getItem('customerToken');
  if (!token) return <Navigate to="/customer/login" replace />;
  return <Outlet />;
};

// ── Layer 1: The Senses — Page View Tracker (GTM + Facebook Pixel) ──
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    pushEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname,
    });
    fbqEvent('PageView');
  }, [location]);

  return null;
}

function trackPageView() {
  const envGtm = appConfig.gtmId;
  if (envGtm && envGtm !== 'GTM-XXXXXXX') {
    initGTM(envGtm);
  }
  fetch(`${API_BASE_URL}/api/marketing/settings`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) return;
      if (data.data?.gtm_id && (!envGtm || envGtm === 'GTM-XXXXXXX')) {
        initGTM(data.data.gtm_id);
      }
      if (data.data?.pixel_id) {
        initFbq(data.data.pixel_id);
      }
    })
    .catch(() => {});
}

// ── Global Command Menu Trigger (Ctrl+K / Cmd+K) ──
function CommandMenuTrigger() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <CommandMenu open={open} onClose={() => setOpen(false)} />;
}

function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" replace />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<CustomerLayout />}>
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resolution-center" element={<ResolutionCenter />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route element={<PrivacyPolicy />} path="/privacy-policy" />
        <Route element={<TermsOfService />} path="/terms-of-service" />
        <Route element={<CustomerProtectedRoute />}>
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/orders" element={<CustomerOrders />} />
        </Route>
        <Route path="/account/track" element={<CustomerTrackOrder />} />
      </Route>

      {/* ── Catch-all Route: কোনো ভুল লিংকে গেলে শপ পেজে পাঠাবে ── */}
      <Route path="*" element={<Navigate to="/shop" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.faviconUrl || parsed.logoUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = resolveImageUrl(parsed.faviconUrl || parsed.logoUrl);
      }
      if (parsed.storeName) {
        document.title = parsed.storeName;
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DeviceProvider>
          <CustomerAIProfileProvider>
          <CartProvider>
            <WebSocketProvider>
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
          
          <Router>
            <PageViewTracker />
            <CommandMenuTrigger />
            <RouteErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <CustomerRoutes />
            </Suspense>
            </RouteErrorBoundary>
          </Router>
            </WebSocketProvider>
          </CartProvider>
          </CustomerAIProfileProvider>
        </DeviceProvider>
        </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
