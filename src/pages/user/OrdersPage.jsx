import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ordersAPI from "../../api/orders.api";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { ORDER_STATUS_LABELS, SERVER_URL } from "../../utils/constants";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.png";
  return image.startsWith("/") ? `${SERVER_URL}${image}` : image;
};

const OrdersPage = () => {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Show success message if redirected from checkout
  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      // Clear message after 5 seconds
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-orders", page],
    queryFn: () => ordersAPI.getUserOrders({ page, limit: 10 }),
    refetchOnMount: "always", // Always refetch when component mounts (e.g., after payment)
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {/* Success Message */}
        {showSuccessMessage && location.state?.message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>{location.state.message}</span>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to load orders
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to create your first order
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Shipping Address:</p>
                      <p className="text-sm">
                        {order.shippingAddress.street},{" "}
                        {order.shippingAddress.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.trackingNumber && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        📦 Tracking Number:{" "}
                        <span className="font-semibold">
                          {order.trackingNumber}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
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
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
