import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import FavoritesLoader from './components/common/FavoritesLoader';
import CartLoader from './components/common/CartLoader';
import GlobalConfirmDialog from './components/common/GlobalConfirmDialog';
import { useEffect } from 'react';
import { fetchCSRFToken } from './utils/csrf';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// reCAPTCHA site key from environment
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Google OAuth client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  // Fetch CSRF token on app load
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  // If no reCAPTCHA key configured, render without provider
  if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === 'your_recaptcha_site_key') {
    return (
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <QueryClientProvider client={queryClient}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <FavoritesLoader />
            <CartLoader />
            <GlobalConfirmDialog />
            <AppRoutes />
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleReCaptchaProvider
          reCaptchaKey={RECAPTCHA_SITE_KEY}
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'head',
          }}
        >
          <QueryClientProvider client={queryClient}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <FavoritesLoader />
            <CartLoader />
            <GlobalConfirmDialog />
            <AppRoutes />
          </QueryClientProvider>
        </GoogleReCaptchaProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
