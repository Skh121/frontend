import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { setupTOTP, verifyAndEnableTOTP, disableTOTP, getTOTPStatus, regenerateBackupCodes } from '../../api/totp.api';
import { getMySessions, revokeSession, revokeAllSessions, getSessionStats } from '../../api/session.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import confirmDialog from '../../utils/confirmDialog.jsx';

const SecuritySettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [totpStatus, setTotpStatus] = useState({ totpEnabled: false, totpVerified: false, backupCodesCount: 0 });
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [activeTab, setActiveTab] = useState('2fa');

  // TOTP setup state
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const [totpSecret, setTotpSecret] = useState(null);
  const [totpToken, setTotpToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Password input for sensitive actions
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, sessionsRes, statsRes] = await Promise.all([
        getTOTPStatus(),
        getMySessions(),
        getSessionStats(),
      ]);

      setTotpStatus(statusRes.data);
      setSessions(sessionsRes.data.sessions);
      setSessionStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    try {
      setError(null);
      const response = await setupTOTP();
      setQRCode(response.data.qrCode);
      setTotpSecret(response.data.secret);
      setShowTOTPSetup(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup TOTP');
    }
  };

  const handleVerifyTOTP = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await verifyAndEnableTOTP(totpToken);
      setBackupCodes(response.data.backupCodes);
      setSuccess('TOTP enabled successfully! Please save your backup codes.');
      setShowTOTPSetup(false);
      setTotpToken('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid TOTP code');
    }
  };

  const handleDisableTOTP = async (pwd) => {
    try {
      setError(null);
      await disableTOTP(pwd);
      setSuccess('TOTP disabled successfully');
      setShowPasswordModal(false);
      setPassword('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable TOTP');
    }
  };

  const handleRegenerateBackupCodes = async (pwd) => {
    try {
      setError(null);
      const response = await regenerateBackupCodes(pwd);
      setBackupCodes(response.data.backupCodes);
      setSuccess('Backup codes regenerated successfully');
      setShowPasswordModal(false);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate backup codes');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    const confirmed = await confirmDialog('Are you sure you want to revoke this session?', {
      confirmText: 'Revoke',
      type: 'warning',
    });
    if (!confirmed) return;

    try {
      setError(null);
      await revokeSession(sessionId);
      toast.success('Session revoked successfully');
      setSuccess('Session revoked successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke session');
      setError(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    const confirmed = await confirmDialog('This will log out all other devices. Continue?', {
      confirmText: 'Revoke All',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      setError(null);
      await revokeAllSessions();
      toast.success('All other sessions revoked successfully');
      setSuccess('All other sessions revoked successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke sessions');
      setError(err.response?.data?.message || 'Failed to revoke sessions');
    }
  };

  const handlePasswordAction = (action) => {
    setPasswordAction(action);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordAction === 'disable-totp') {
      handleDisableTOTP(password);
    } else if (passwordAction === 'regenerate-codes') {
      handleRegenerateBackupCodes(password);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadBackupCodes = () => {
    const content = `Shopping Platform - Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>

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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('2fa')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === '2fa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              TOTP-Based MFA
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Sessions
            </button>
          </nav>
        </div>

        {/* TOTP-Based MFA Tab */}
        {activeTab === '2fa' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">TOTP-Based Multi-Factor Authentication</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Time-based One-Time Password (TOTP) adds an extra layer of security to your account.
                    After enabling, you'll need both your password and a code from your authenticator app to log in.
                  </p>
                </div>
              </div>
            </div>

            {/* TOTP Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Multi-Factor Authentication</h2>
              <p className="text-sm text-gray-600 mb-4">
                Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator for time-based codes that rotate every 30 seconds.
              </p>

              {!totpStatus.totpEnabled ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Why enable TOTP MFA?</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Enhanced security with time-based codes</li>
                      <li>Works offline (no internet required)</li>
                      <li>10 backup codes for emergency access</li>
                      <li>Industry-standard security practice</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleSetupTOTP}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Enable TOTP-Based MFA
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-semibold">TOTP-Based MFA is Active</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Your account is protected with time-based multi-factor authentication.
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Backup Codes</p>
                      <p className="text-sm text-gray-600">
                        {totpStatus.backupCodesCount} backup code{totpStatus.backupCodesCount !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                    {totpStatus.backupCodesCount < 3 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Low
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handlePasswordAction('regenerate-codes')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Regenerate Backup Codes
                    </button>
                    <button
                      onClick={() => handlePasswordAction('disable-totp')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                      Disable MFA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Backup Codes Display */}
            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Your Backup Codes</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Save these codes in a safe place. Each code can only be used once if you lose access to your authenticator app.
                </p>
                <div className="bg-white rounded p-4 mb-4 font-mono text-sm grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Download Codes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Session Stats */}
            {sessionStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Sessions</h3>
                  <p className="text-3xl font-bold text-gray-900">{sessionStats.activeSessions}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sessions</h3>
                  <p className="text-3xl font-bold text-gray-900">{sessionStats.totalSessions}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Suspicious</h3>
                  <p className="text-3xl font-bold text-red-600">{sessionStats.suspiciousSessions}</p>
                </div>
              </div>
            )}

            {/* Active Sessions List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div key={session.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            {session.deviceInfo.device === 'Mobile' ? (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : session.deviceInfo.device === 'Tablet' ? (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {session.deviceInfo.browser} on {session.deviceInfo.os}
                              {session.isCurrent && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                  Current
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500">IP: {session.ip}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Last active: {formatDate(session.lastActivity)}</p>
                          <p>Signed in: {formatDate(session.createdAt)}</p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOTP Setup Modal */}
        {showTOTPSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup TOTP-Based MFA</h2>
              <p className="text-sm text-gray-500 mb-4">
                Scan the QR code below with your authenticator app
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  Recommended apps: Google Authenticator, Authy, Microsoft Authenticator
                </p>
              </div>
              {qrCode && (
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              <p className="text-xs text-gray-500 mb-4">
                Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{totpSecret}</code>
              </p>
              <form onSubmit={handleVerifyTOTP}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter the 6-digit code from your app:
                </label>
                <input
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Verify & Enable
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTOTPSetup(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirm with Password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Please enter your password to continue.
              </p>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                  placeholder="Enter your password"
                  required
                />
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
