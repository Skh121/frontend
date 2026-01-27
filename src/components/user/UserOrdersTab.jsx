import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ordersAPI from '../../api/orders.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { ORDER_STATUS_LABELS, SERVER_URL } from '../../utils/constants';

const getImageUrl = (image) => {
    if (!image) return '/placeholder.png';
    return image.startsWith('/') ? `${SERVER_URL}${image}` : image;
};

const UserOrdersTab = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['user-orders', page],
        queryFn: () => ordersAPI.getUserOrders({ page, limit: 10 }),
        refetchOnMount: 'always',
    });

    const orders = data?.data?.orders || [];
    const pagination = data?.data?.pagination || {};

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            succeeded: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Failed to load orders
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
                <p className="text-gray-600 mb-6">Start shopping to create your first order</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Order History</h2>
            {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {ORDER_STATUS_LABELS[order.status]}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
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
                                {order.shippingAddress.street}, {order.shippingAddress.city}
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
                                📦 Tracking Number: <span className="font-semibold">{order.trackingNumber}</span>
                            </p>
                        </div>
                    )}
                </div>
            ))}

            {pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

export default UserOrdersTab;
