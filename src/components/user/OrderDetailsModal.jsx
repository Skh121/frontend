import { useQuery } from '@tanstack/react-query';
import ordersAPI from '../../api/orders.api';
import LoadingSpinner from '../common/LoadingSpinner';
import { ORDER_STATUS_LABELS, SERVER_URL } from '../../utils/constants';

const getImageUrl = (image) => {
    if (!image) return '/placeholder.png';
    return image.startsWith('/') ? `${SERVER_URL}${image}` : image;
};

const OrderDetailsModal = ({ orderId, onClose }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['order-details', orderId],
        queryFn: () => ordersAPI.getOrder(orderId),
        enabled: !!orderId,
    });


    const order = data?.data?.order;

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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Order Details</h2>
                        {order && <p className="text-blue-200 text-sm">#{order.orderNumber}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                            <p className="font-bold">Failed to load order</p>
                            <p className="text-sm">{error?.response?.data?.message || 'Something went wrong'}</p>
                        </div>
                    )}

                    {order && (
                        <div className="space-y-6">
                            {/* IDOR Demo Banner */}
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                <p className="text-xs text-yellow-700 font-semibold">🔐 Order ID (for IDOR testing):</p>
                                <p className="font-mono text-sm text-yellow-800 break-all select-all">{order._id}</p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(order.status)}`}>
                                    {ORDER_STATUS_LABELS[order.status]}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    Payment: <span className="font-semibold capitalize">{order.paymentStatus}</span>
                                </span>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Items Ordered</h3>
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="font-bold text-blue-600">${(item.quantity * item.price).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-2">📍 Shipping Address</h3>
                                    <p className="text-gray-700">{order.shippingAddress.street}</p>
                                    <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p className="text-gray-700">{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-2">📞 Contact</h3>
                                    <p className="text-blue-600 font-semibold">{order.phone}</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Placed: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-gray-700 font-semibold">Total Amount</span>
                                <span className="text-3xl font-black text-blue-600">${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
