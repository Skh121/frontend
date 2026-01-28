import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportUserData, getDeletionEligibility, requestAccountDeletion } from '../../api/gdpr.api';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PrivacySettingsPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const response = await getDeletionEligibility();
      setEligibility(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);
      const response = await exportUserData();

      // Create and download JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess('Your data has been exported successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (confirmation !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await requestAccountDeletion(password, confirmation);
      setSuccess('Your account has been deleted. You will be logged out shortly.');

      // Logout and redirect after 3 seconds
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy & Data Settings</h1>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Data Export Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Export Your Data</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Download a copy of all your personal data stored in our system. This includes your profile information,
              order history, activity logs, and more.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">What's included:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Personal information (name, email, phone)</li>
                <li>Order history and shipping addresses</li>
                <li>Activity logs and login history</li>
                <li>Account security settings</li>
                <li>Shopping cart and favorites</li>
              </ul>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting...' : 'Export My Data'}
            </button>
          </div>
        </div>

        {/* Account Deletion Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Delete Your Account</h2>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">Warning: This action is permanent</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Your account will be permanently deleted</li>
                    <li>• You will lose access to all order history</li>
                    <li>• This action cannot be undone</li>
                    <li>• Completed orders will be anonymized for legal compliance</li>
                  </ul>
                </div>
              </div>
            </div>

            {eligibility && !eligibility.eligible && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Account deletion not available</h3>
                <p className="text-sm text-red-800 mb-2">{eligibility.message}</p>
                {eligibility.pendingOrders.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-900">Pending orders:</p>
                    <ul className="text-sm text-red-800 list-disc list-inside">
                      {eligibility.pendingOrders.map((order) => (
                        <li key={order.orderNumber}>
                          {order.orderNumber} - {order.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!eligibility?.eligible}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Account</h2>
              <p className="text-sm text-gray-600 mb-4">
                This action is permanent and cannot be undone. All your data will be permanently deleted.
              </p>

              <form onSubmit={handleDeleteAccount}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your password to confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors focus:outline-hidden"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                    Type "DELETE MY ACCOUNT" to confirm
                  </label>
                  <input
                    type="text"
                    id="confirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="DELETE MY ACCOUNT"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={deleting || confirmation !== 'DELETE MY ACCOUNT'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Deletion'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPassword('');
                      setConfirmation('');
                      setShowPassword(false);
                    }}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Data Retention Policy */}
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Data Retention Policy</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Active Account Data:</strong> Retained while your account is active
                </div>
              </div>
              <div className="flex">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Inactive Account Data:</strong> Deleted after 2 years of inactivity
                </div>
              </div>
              <div className="flex">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Audit Logs:</strong> Retained for 1 year for security purposes
                </div>
              </div>
              <div className="flex">
                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Order History:</strong> Retained for 7 years to comply with legal requirements
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
