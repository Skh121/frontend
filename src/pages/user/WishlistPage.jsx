import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { favoritesAPI } from '../../api/favorites.api';
import { cartAPI } from '../../api/cart.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useFavoritesStore from '../../store/favoritesStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { SERVER_URL } from '../../utils/constants';
import confirmDialog from '../../utils/confirmDialog.jsx';

const getImageUrl = (image) => {
  if (!image) return null;
  return image.startsWith('/') ? `${SERVER_URL}${image}` : image;
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const { setFavorites, removeFavorite, favoriteIds } = useFavoritesStore();

  // Fetch favorites
  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getFavorites(),
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setFavorites(data?.data?.products || []);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">❤️</div>
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Locked</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Please log in to view your saved items or add new favorites.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-3 text-lg"
            >
              Login to View Wishlist
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const products = data?.data?.products || [];

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (productId) => favoritesAPI.toggleFavorite(productId),
    onSuccess: (response, productId) => {
      removeFavorite(productId);
      queryClient.invalidateQueries(['favorites']);
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId) => cartAPI.addToCart(productId, 1),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(['cart']);
      toast.success('Product added to cart!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    },
  });

  const handleRemoveFromWishlist = async (productId) => {
    const confirmed = await confirmDialog('Remove this item from your wishlist?', {
      confirmText: 'Remove',
      type: 'danger',
    });
    if (confirmed) {
      removeFavoriteMutation.mutate(productId);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    addToCartMutation.mutate(product._id);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {products.length > 0
                ? `You have ${products.length} item${products.length !== 1 ? 's' : ''} in your wishlist`
                : 'Your wishlist is empty'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              Failed to load wishlist. Please try again.
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Save your favorite items for later
              </p>
              <Link to="/products" className="btn-primary inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                >
                  <Link to={`/products/${product._id}`} className="block relative">
                    <div className="relative h-48 bg-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}
                      {product.featured && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 truncate">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : 'Out of stock'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          product.stock === 0 || addToCartMutation.isPending
                        }
                        className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        disabled={removeFavoriteMutation.isPending}
                        className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                      >
                        Remove from Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;
