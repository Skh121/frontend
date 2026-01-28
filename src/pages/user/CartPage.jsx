import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import cartAPI from "../../api/cart.api";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { SERVER_URL } from "../../utils/constants";
import confirmDialog from "../../utils/confirmDialog.jsx";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.png";
  return image.startsWith("/") ? `${SERVER_URL}${image}` : image;
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart: storeCart, setCart } = useCartStore(); // Modified this line
  const queryClient = useQueryClient(); // Moved this line

  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: cartAPI.getCart,
    enabled: isAuthenticated,
  });

  // Keep store in sync with background refetches
  useEffect(() => {
    if (data?.data?.cart) {
      setCart(data.data.cart);
    }
  }, [data, setCart]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Locked</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Please log in to view requested items or add new products to your
              shopping cart.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary w-full py-3 text-lg"
            >
              Login to View Cart
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartAPI.updateCartItem(productId, quantity),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(["cart"]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => cartAPI.removeFromCart(productId),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(["cart"]);
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove item");
    },
  });

  const cart = data?.data?.cart;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateMutation.mutate({ productId, quantity: newQuantity });
  };

  const handleRemove = async (productId) => {
    const confirmed = await confirmDialog("Remove this item from cart?", {
      confirmText: "Remove",
      type: "danger",
    });
    if (confirmed) {
      removeMutation.mutate(productId);
    }
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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to load cart
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to add items to your cart
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-6 border-b last:border-b-0"
                  >
                    <img
                      src={getImageUrl(item.product?.images?.[0])}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        ${item.price?.toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity - 1,
                            )
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
                          disabled={updateMutation.isPending}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity + 1,
                            )
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
                          disabled={updateMutation.isPending}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600 mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        disabled={removeMutation.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ${cart.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {cart.totalPrice > 100 ? "FREE" : "$10.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-semibold">
                      ${(cart.totalPrice * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">
                        $
                        {(
                          cart.totalPrice +
                          (cart.totalPrice > 100 ? 0 : 10) +
                          cart.totalPrice * 0.1
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {cart.totalPrice > 100 && (
                  <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">
                    ✓ You qualify for free shipping!
                  </div>
                )}

                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary w-full"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="btn-secondary w-full mt-3"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
