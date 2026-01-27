import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import cartAPI from "../../api/cart.api";
import ordersAPI from "../../api/orders.api";
import paymentAPI from "../../api/payment.api";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CheckoutForm from "../../components/checkout/CheckoutForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);
  const [shippingInfo, setShippingInfo] = useState({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Nepal",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartAPI.getCart,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => ordersAPI.createOrder(data),
    onSuccess: (response) => {
      console.log("Order created successfully:", response.data.order);
      const newOrderId = response.data.order._id;
      setOrderId(newOrderId);

      // Trigger payment intent creation
      console.log("Creating payment intent for order:", newOrderId);
      createPaymentIntentMutation.mutate(newOrderId);
    },
    onError: (error) => {
      console.error("Order creation error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create order";

      if (error.response?.status === 401) {
        toast.error(
          "Authentication error: " +
            errorMessage +
            ". Please refresh the page and try again.",
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: (orderId) => paymentAPI.createPaymentIntent(orderId),
    onSuccess: (response) => {
      setClientSecret(response.data.clientSecret);
      setStep(2);
    },
    onError: (error) => {
      console.error("Payment intent creation error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to initialize payment";

      if (error.response?.status === 401) {
        toast.error(
          "Authentication error. Please try refreshing the page and logging in again if the issue persists.",
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const cart = cartData?.data?.cart;

  const validateShippingForm = () => {
    const newErrors = {};

    // Street validation
    if (!shippingInfo.street.trim()) {
      newErrors.street = "Street address is required";
    } else if (shippingInfo.street.length > 200) {
      newErrors.street = "Street address is too long (max 200 characters)";
    }

    // City validation
    if (!shippingInfo.city.trim()) {
      newErrors.city = "City is required";
    } else if (shippingInfo.city.length > 100) {
      newErrors.city = "City is too long (max 100 characters)";
    }

    // Province validation
    if (!shippingInfo.province.trim()) {
      newErrors.province = "Province is required";
    } else if (shippingInfo.province.length > 100) {
      newErrors.province = "Province is too long (max 100 characters)";
    }

    // Zip code validation
    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (shippingInfo.zipCode.length > 20) {
      newErrors.zipCode = "Zip code is too long (max 20 characters)";
    } else if (!/^[\d\s\-]+$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = "Invalid zip code format";
    }

    // Country validation
    if (!shippingInfo.country.trim()) {
      newErrors.country = "Country is required";
    } else if (shippingInfo.country.length > 100) {
      newErrors.country = "Country is too long (max 100 characters)";
    }

    // Phone validation - Nepal phone numbers: 10 digits starting with 9
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^9\d{9}$/.test(shippingInfo.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits starting with 9";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    if (!validateShippingForm()) {
      return;
    }

    // Create order with shipping information
    createOrderMutation.mutate({
      shippingAddress: {
        street: shippingInfo.street.trim(),
        city: shippingInfo.city.trim(),
        state: shippingInfo.province.trim(),
        zipCode: shippingInfo.zipCode.trim(),
        country: shippingInfo.country.trim(),
      },
      phone: shippingInfo.phone.trim(),
    });
  };

  const handleInputChange = (field, value) => {
    setShippingInfo({ ...shippingInfo, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Manually confirm payment with backend (fallback for development when webhooks don't work)
      console.log("Confirming payment for order:", orderId);
      await paymentAPI.confirmPayment(orderId);
      console.log("Payment confirmed successfully");
    } catch (error) {
      console.error("Error confirming payment:", error);
      // Continue anyway - the payment succeeded on Stripe even if confirmation failed
    }

    // Clear cart and redirect to orders page
    queryClient.invalidateQueries(["cart"]);
    queryClient.invalidateQueries(["user-orders"]);
    navigate("/orders", {
      state: {
        message: "Payment successful! Your order has been placed.",
        orderId,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <LoadingSpinner fullScreen />
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add items to your cart before checking out
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.totalPrice;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
              >
                1
              </div>
              <span className="ml-2 font-semibold">Shipping</span>
            </div>
            <div
              className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
            ></div>
            <div
              className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
              >
                2
              </div>
              <span className="ml-2 font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.street}
                      onChange={(e) =>
                        handleInputChange("street", e.target.value)
                      }
                      className={`input-field ${errors.street ? "border-red-500" : ""}`}
                      placeholder="123 Main St, Apt 4B"
                      maxLength={200}
                    />
                    {errors.street && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className={`input-field ${errors.city ? "border-red-500" : ""}`}
                        placeholder="Kathmandu"
                        maxLength={100}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.province}
                        onChange={(e) =>
                          handleInputChange("province", e.target.value)
                        }
                        className={`input-field ${errors.province ? "border-red-500" : ""}`}
                        placeholder="Bagmati"
                        maxLength={100}
                      />
                      {errors.province && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.province}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        className={`input-field ${errors.zipCode ? "border-red-500" : ""}`}
                        placeholder="10001"
                        maxLength={20}
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className={`input-field ${errors.country ? "border-red-500" : ""}`}
                        placeholder="USA"
                        maxLength={100}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`input-field ${errors.phone ? "border-red-500" : ""}`}
                      placeholder="9800000000"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10 digit phone number starting with 9
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={
                      createOrderMutation.isPending ||
                      createPaymentIntentMutation.isPending
                    }
                  >
                    {createOrderMutation.isPending ||
                    createPaymentIntentMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">
                          {createOrderMutation.isPending
                            ? "Creating order..."
                            : "Setting up payment..."}
                        </span>
                      </span>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 2 && clientSecret && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 flex items-center">
                    <span className="mr-2">🔒</span>
                    Payments are securely processed by Stripe
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold">Shipping To:</h3>
                  <div className="text-gray-600 bg-gray-50 p-4 rounded">
                    <p>{shippingInfo.street}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.province}{" "}
                      {shippingInfo.zipCode}
                    </p>
                    <p>{shippingInfo.country}</p>
                    <p className="mt-2 text-sm">📞 {shippingInfo.phone}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Change shipping address
                  </button>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setStep(1)}
                    totalAmount={total}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping === 0 && (
                <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg">
                  ✓ You're getting free shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
