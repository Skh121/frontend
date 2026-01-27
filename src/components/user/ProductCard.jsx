import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { cartAPI } from "../../api/cart.api";
import { favoritesAPI } from "../../api/favorites.api";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import useFavoritesStore from "../../store/favoritesStore";
import { SERVER_URL } from "../../utils/constants";

const getImageUrl = (image) => {
  if (!image) return null;
  return image.startsWith("/") ? `${SERVER_URL}${image}` : image;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const { favoriteIds, addFavorite, removeFavorite } = useFavoritesStore();
  const queryClient = useQueryClient();

  const isFavorited = favoriteIds.has(product._id);

  const addToCartMutation = useMutation({
    mutationFn: () => cartAPI.addToCart(product._id, 1),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(["cart"]);
      toast.success("Product added to cart!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => favoritesAPI.toggleFavorite(product._id),
    onSuccess: (response) => {
      if (response.data.isFavorited) {
        addFavorite(product._id);
      } else {
        removeFavorite(product._id);
      }
      queryClient.invalidateQueries(["favorites"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update favorites",
      );
    },
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to add items to favorites");
      navigate("/login");
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <div className="product-card group relative">
      <Link to={`/products/${product._id}`}>
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 badge badge-warning shadow-sm">
              Featured
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all hover:bg-white"
            title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart
              className={`w-5 h-5 transition-colors ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/products/${product._id}`}>
          <h3 className="heading-3 text-lg mb-2 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-10">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="btn-primary py-2 px-3 text-sm gap-2"
            >
              <FiShoppingCart className="w-4 h-4" />
              {addToCartMutation.isPending ? "Adding..." : "Add"}
            </button>
          ) : (
            <span className="text-red-600 font-medium text-sm">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
