import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import StorefrontRoute from './StorefrontRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import IdleTimerWrapper from '../components/auth/IdleTimerWrapper';

// Auth pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));

// User pages
const HomePage = lazy(() => import('../pages/user/HomePage'));
const ProductsPage = lazy(() => import('../pages/user/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/user/ProductDetailPage'));
const WishlistPage = lazy(() => import('../pages/user/WishlistPage'));
const CartPage = lazy(() => import('../pages/user/CartPage'));
const CheckoutPage = lazy(() => import('../pages/user/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/user/OrdersPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ChangePasswordPage = lazy(() => import('../pages/user/ChangePasswordPage'));
const SecuritySettingsPage = lazy(() => import('../pages/user/SecuritySettingsPage'));
const PrivacySettingsPage = lazy(() => import('../pages/user/PrivacySettingsPage'));
const OrderDetailsPage = lazy(() => import('../pages/user/OrderDetailsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminActivityLogs = lazy(() => import('../pages/admin/AdminActivityLogs'));
const AdminLayout = lazy(() => import('../components/admin/AdminLayout'));

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Page not found</p>
      <a href="/" className="btn-primary">
        Go Home
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <IdleTimerWrapper />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<StorefrontRoute><HomePage /></StorefrontRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/products"
            element={<StorefrontRoute><ProductsPage /></StorefrontRoute>}
          />
          <Route
            path="/products/:id"
            element={<StorefrontRoute><ProductDetailPage /></StorefrontRoute>}
          />

          {/* Protected user routes */}
          <Route
            path="/wishlist"
            element={
              <StorefrontRoute><WishlistPage /></StorefrontRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <StorefrontRoute><CartPage /></StorefrontRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/security"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <StorefrontRoute>
                <ProtectedRoute>
                  <PrivacySettingsPage />
                </ProtectedRoute>
              </StorefrontRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="activity-logs" element={<AdminActivityLogs />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
