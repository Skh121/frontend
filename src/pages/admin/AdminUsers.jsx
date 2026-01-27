import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import adminAPI from '../../api/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import confirmDialog from '../../utils/confirmDialog.jsx';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'suspend'
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminAPI.getAllUsers({ page, limit: 10, search, role: 'user' }),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      closeModal();
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (id) => adminAPI.unsuspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User unsuspended successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unsuspend user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalType('');
    setSuspendReason('');
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setIsModalOpen(true);
  };

  const openSuspendModal = (user) => {
    setSelectedUser(user);
    setSuspendReason('');
    setModalType('suspend');
    setIsModalOpen(true);
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    suspendMutation.mutate({ id: selectedUser._id, reason: suspendReason });
  };

  const handleUnsuspend = async (user) => {
    const confirmed = await confirmDialog('Are you sure you want to unsuspend this user?', {
      confirmText: 'Unsuspend',
      type: 'warning',
    });
    if (confirmed) {
      unsuspendMutation.mutate(user._id);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = await confirmDialog(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`, {
      confirmText: 'Delete',
      type: 'danger',
    });
    if (confirmed) {
      deleteMutation.mutate(user._id);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${user.isSuspended
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${user.isEmailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </button>
                      {user.isSuspended ? (
                        <button
                          onClick={() => handleUnsuspend(user)}
                          className="text-green-600 hover:text-green-900 font-medium"
                          disabled={unsuspendMutation.isPending}
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          onClick={() => openSuspendModal(user)}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900 font-medium"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-fade-in">
            {/* View User Modal */}
            {modalType === 'view' && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">User Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-blue-100 border-4 border-white shadow-lg flex items-center justify-center text-blue-600 text-3xl font-bold">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                      <p className="text-gray-900 font-medium">{selectedUser.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                      <p className="text-gray-900 font-medium">{selectedUser.lastName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                      <p className="text-gray-900 font-medium">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                      <p className="text-gray-900 font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Verified</label>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Joined</label>
                      <p className="text-gray-900 font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selectedUser.isSuspended && selectedUser.suspensionReason && (
                      <div className="col-span-2 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                        <label className="block text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Suspension Reason</label>
                        <p className="text-red-600 text-sm">{selectedUser.suspensionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <button onClick={closeModal} className="btn-secondary w-full py-2.5">
                    Close
                  </button>
                </div>
              </>
            )}

            {/* Suspend User Modal */}
            {modalType === 'suspend' && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Suspend User</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to suspend <span className="font-semibold text-gray-900">{selectedUser.email}</span>?
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Please explain why this user is being suspended..."
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                  <span className="text-amber-500 text-xl">⚠️</span>
                  <p className="text-sm text-amber-800">
                    Suspended users will be immediately logged out and blocked from accessing their account.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSuspend}
                    disabled={suspendMutation.isPending}
                    className="btn-primary flex-1 bg-red-600 hover:bg-red-700 border-red-600"
                  >
                    {suspendMutation.isPending ? 'Suspending...' : 'Suspend User'}
                  </button>
                  <button onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
