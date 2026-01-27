import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import authAPI from '../api/auth.api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => authAPI.resetPassword(data.token, data.password),
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return;
    }

    resetPasswordMutation.mutate({ token, password: formData.password });
  }, [formData, token, resetPasswordMutation]);

  // No token provided
  if (!token) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn-primary inline-block">
                Request New Link
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Go to Login
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reset Your Password
              </h1>
              <p className="text-gray-600 mt-2">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                />
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-sm mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="btn-primary w-full flex items-center justify-center"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Resetting...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;

