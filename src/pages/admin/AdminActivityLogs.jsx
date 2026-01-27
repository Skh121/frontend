import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import auditAPI from '../../api/audit.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'auth', label: 'Authentication' },
  { value: 'user', label: 'User' },
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
  { value: 'payment', label: 'Payment' },
  { value: 'order', label: 'Order' },
  { value: 'product', label: 'Product' },
  { value: 'cart', label: 'Cart' },
  { value: 'favorite', label: 'Favorites' },
  { value: 'admin', label: 'Admin' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severity' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
];

const getSeverityBadgeClass = (severity) => {
  switch (severity) {
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'critical':
      return 'bg-red-200 text-red-900 font-bold';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'auth':
      return 'bg-purple-100 text-purple-800';
    case 'user':
      return 'bg-teal-100 text-teal-800';
    case 'profile':
      return 'bg-green-100 text-green-800';
    case 'security':
      return 'bg-red-100 text-red-800';
    case 'payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'order':
      return 'bg-blue-100 text-blue-800';
    case 'product':
      return 'bg-indigo-100 text-indigo-800';
    case 'cart':
      return 'bg-orange-100 text-orange-800';
    case 'favorite':
      return 'bg-pink-100 text-pink-800';
    case 'admin':
      return 'bg-gray-800 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AdminActivityLogs = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    startDate: '',
    endDate: '',
    userId: '',
  });

  // Fetch audit statistics
  const { data: statsData } = useQuery({
    queryKey: ['admin-audit-stats'],
    queryFn: auditAPI.getAuditStats,
  });

  const stats = statsData?.data || {};

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', page, limit, filters],
    queryFn: () =>
      auditAPI.getAllLogs({
        page,
        limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '')
        ),
      }),
    keepPreviousData: true,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      severity: '',
      startDate: '',
      endDate: '',
      userId: '',
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAction = (action) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Activity Logs</h1>
          <p className="text-gray-500 mt-1">
            Monitor all user activities across the platform
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          Total: <span className="font-semibold text-gray-700">{pagination.total}</span> logs
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalLogs || 0}</div>
          <div className="text-sm text-gray-500">Total Logs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.recentLogs || 0}</div>
          <div className="text-sm text-gray-500">Last 30 Days</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-red-600">{stats.failedLogins || 0}</div>
          <div className="text-sm text-gray-500">Failed Logins</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.securityEvents || 0}</div>
          <div className="text-sm text-gray-500">Security Events</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.adminActions || 0}</div>
          <div className="text-sm text-gray-500">Admin Actions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field w-40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="input-field w-36"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>

          <button
            onClick={clearFilters}
            className="btn-secondary h-10"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to load activity logs
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-lg">No activity logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {log.userId?.firstName} {log.userId?.lastName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {log.userId?.email}
                        </div>
                        {log.userId?.role === 'admin' && (
                          <span className="text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAction(log.action)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(
                          log.severity
                        )}`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {log.success ? (
                        <span className="text-green-600 text-sm">✓ Success</span>
                      ) : (
                        <span className="text-red-600 text-sm">✗ Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-700">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span> (
                    {pagination.total} total logs)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={page === pagination.totalPages}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
