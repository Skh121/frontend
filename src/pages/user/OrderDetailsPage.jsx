import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ordersAPI from '../../api/orders.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { SERVER_URL, ORDER_STATUS_LABELS } from '../../utils/constants';

const getImageUrl = (image) => {
    if (!image) return '/placeholder.png';
    return image.startsWith('/') ? `${SERVER_URL}${image}` : image;
};

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['order-details', id],
        queryFn: () => ordersAPI.getOrder(id),
    });

    const order = data?.data?.order;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="grow flex justify-center items-center">
                    <LoadingSpinner size="lg" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="grow container mx-auto px-4 py-12 text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-6"> {error?.response?.data?.message || "We couldn't find the order you're looking for."}</p>
                    <button onClick={() => navigate('/profile')} className="btn-primary">
                        Back to Profile
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="grow container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/profile')}
                    className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    ← Back to Orders
                </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-6 md:flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Order Details</h1>
                            <p className="opacity-90">#{order.orderNumber}</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                            <span className="bg-white text-blue-600 px-4 py-1 rounded-full font-bold uppercase tracking-wider text-sm">
                                {ORDER_STATUS_LABELS[order.status]}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* ID Banner for IDOR Demo */}
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800">
                            <p className="text-xs font-mono">DEBUG INFO (For IDOR Test):</p>
                            <p className="font-mono text-sm break-all">{order._id}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Items */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2">Items Ordered</h3>
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg border"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} x ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold border-b pb-2">Shipping Information</h3>
                                    <div className="mt-3 text-gray-700">
                                        <p className="font-semibold">{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                        <p>{order.shippingAddress.country}</p>
                                        <p className="mt-2 text-blue-600">📞 {order.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold border-b pb-2">Payment Status</h3>
                                    <p className="mt-3 capitalize font-semibold shadow-inner p-2 bg-gray-50 rounded text-center">
                                        {order.paymentStatus}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 p-6 rounded-xl flex justify-end">
                            <div className="text-right">
                                <p className="text-gray-600">Total Amount</p>
                                <p className="text-4xl font-black text-blue-600">${order.totalPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderDetailsPage;
