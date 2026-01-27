import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import authAPI from '../api/auth.api';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const { clearCart } = useCartStore();

  const email = location.state?.email || '';
  const devPin = location.state?.devPin || '';

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split('');
      while (newPin.length < 6) newPin.push('');
      setPin(newPin);

      // Focus last filled input or last input
      const focusIndex = Math.min(pastedData.length, 5);
      document.getElementById(`pin-${focusIndex}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pinCode = pin.join('');
    if (pinCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!email) {
      setError('Email not provided. Please register again.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyEmail(email, pinCode);

      // CRITICAL: Clear previous session data before setting new user
      queryClient.clear(); // Clear all cached data from previous session
      clearCart(); // Clear cart from previous session

      // Set user in store (user is now logged in)
      if (response.data?.user) {
        setUser(response.data.user);
      }

      // Redirect to home
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN. Please try again.');
      setPin(['', '', '', '', '', '']);
      document.getElementById('pin-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow flex items-center justify-center py-12 px-4 bg-linear-to-br from-purple-50 to-pink-50">
        <div className="max-w-md w-full">
          <div className="card text-center animate-fade-in">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit PIN to<br />
              <strong>{email}</strong>
            </p>

            {devPin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-semibold">🔧 Development Mode</p>
                <p className="text-lg font-mono text-yellow-900 mt-2">{devPin}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-2 mb-6">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pin.join('').length !== 6}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6">
              Didn't receive the PIN?{' '}
              <button className="text-purple-600 hover:text-purple-700 font-semibold">
                Resend PIN
              </button>
            </p>

            <p className="text-xs text-gray-400 mt-4">
              PIN expires in 10 minutes
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
