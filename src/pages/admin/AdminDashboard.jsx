import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import adminAPI from "../../api/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { ORDER_STATUS_LABELS } from "../../utils/constants";

const AdminDashboard = () => {
  const [page, setPage] = useState(1);

  // Fetch stats (counts)
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminAPI.getDashboardStats,
  });

  // Fetch paginated orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => adminAPI.getAllOrders({ page, limit: 10 }),
  });

  const stats = statsData?.data;
  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination || {};

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError || ordersError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Total Products
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-slate-800">
                ${(stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table with Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
        </div>

        {orders.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg">
            No orders yet
          </p>
        )}
      </div>

      {/* Pending Orders Alert */}
      {stats?.pendingOrders > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-amber-800 font-medium">
            You have <strong>{stats.pendingOrders}</strong> pending order(s)
            that need attention.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
