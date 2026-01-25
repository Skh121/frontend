import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import userAPI from '../../api/user.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isExpired = location.state?.passwordExpired || false;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordExpiryInfo, setPasswordExpiryInfo] = useState(null);

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: (response) => {
      setSuccess(true);
      setError('');
      setPasswordExpiryInfo(response.data);

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to change password. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/\d/.test(formData.newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword)) {
      setError('Password must contain at least one special character');
      return;
    }

    // Check if new password is same as current password
    if (formData.newPassword === formData.currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Changed Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your password has been updated successfully.
            </p>
            {passwordExpiryInfo && passwordExpiryInfo.passwordExpiresIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Your new password will expire in{' '}
                  <span className="font-semibold">{passwordExpiryInfo.passwordExpiresIn} days</span>
                  <br />
                  <span className="text-xs text-blue-600">
                    Expiry date: {new Date(passwordExpiryInfo.passwordExpiryDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
            <div className="flex justify-center mb-4">
              <LoadingSpinner size="sm" />
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Password
          </h2>
          {isExpired && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Password Expired</p>
              <p className="text-sm">
                Your password has expired. Please create a new password to continue using your account.
              </p>
            </div>
          )}
          <p className="mt-2 text-center text-sm text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={formData.currentPassword}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter a strong new password"
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={formData.newPassword} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Password Policy</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Passwords expire every 90 days</li>
              <li>• Cannot reuse your last 5 passwords</li>
              <li>• Must be at least 12 characters long</li>
              <li>• Must contain uppercase, lowercase, number, and special character</li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-primary w-full flex justify-center items-center"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Changing password...</span>
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>

          {!isExpired && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
