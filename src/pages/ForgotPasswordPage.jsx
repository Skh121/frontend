import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import authAPI from '../api/auth.api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ForgotPasswordPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (data) => authAPI.forgotPassword(data.email, data.captchaToken),
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    },
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    let captchaToken = 'dev_token'; // Default for development

    // Get reCAPTCHA token if available
    if (executeRecaptcha) {
      try {
        captchaToken = await executeRecaptcha('forgot_password');
      } catch (err) {
        console.error('reCAPTCHA error:', err);
        setError('CAPTCHA verification failed. Please try again.');
        return;
      }
    }

    forgotPasswordMutation.mutate({ email, captchaToken });
  }, [email, executeRecaptcha, forgotPasswordMutation]);

  if (success) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Back to Login
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
                Forgot Password?
              </h1>
              <p className="text-gray-600 mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="btn-primary w-full flex items-center justify-center"
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                ← Back to Login
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              apply.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;

