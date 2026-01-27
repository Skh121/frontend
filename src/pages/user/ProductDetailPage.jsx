import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsAPI } from '../../api/products.api';
import { cartAPI } from '../../api/cart.api';
import { favoritesAPI } from '../../api/favorites.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useFavoritesStore from '../../store/favoritesStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { SERVER_URL } from '../../utils/constants';

const getImageUrl = (image) => {
  if (!image) return null;
  return image.startsWith('/') ? `${SERVER_URL}${image}` : image;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const { favoriteIds, addFavorite, removeFavorite } = useFavoritesStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
  });

  const product = data?.data?.product;
  const isFavorited = product ? favoriteIds.has(product._id) : false;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => cartAPI.addToCart(product._id, quantity),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(['cart']);
      toast.success(`${quantity} item(s) added to cart!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => favoritesAPI.toggleFavorite(product._id),
    onSuccess: (response) => {
      if (response.data.isFavorited) {
        addFavorite(product._id);
      } else {
        removeFavorite(product._id);
      }
      queryClient.invalidateQueries(['favorites']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to favorites');
      navigate('/login');
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
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

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
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
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-2 text-gray-500">
              <li>
                <Link to="/" className="hover:text-blue-600">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/products" className="hover:text-blue-600">Products</Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium truncate">{product.name}</li>
            </ol>
          </nav>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div>
                <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[selectedImage])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedImage === index
                            ? 'border-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    {product.category && (
                      <span className="inline-block bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    disabled={toggleFavoriteMutation.isPending}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg
                      className={`w-8 h-8 ${
                        isFavorited
                          ? 'fill-red-500 text-red-500'
                          : 'fill-none text-gray-400 hover:text-red-500'
                      }`}
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>

                {product.featured && (
                  <div className="mb-4">
                    <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded">
                      Featured Product
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-sm font-medium ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : 'Out of stock'}
                    </span>
                    {product.views > 0 && (
                      <span className="text-sm text-gray-500">
                        {product.views} views
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-16 text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                    className="btn-primary w-full py-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {addToCartMutation.isPending
                      ? 'Adding...'
                      : product.stock > 0
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="w-full py-3 text-lg border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Additional Product Info */}
                {(product.brand || product.sku) && (
                  <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                    {product.sku && (
                      <div className="flex justify-between">
                        <span className="font-medium">SKU:</span>
                        <span>{product.sku}</span>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex justify-between">
                        <span className="font-medium">Brand:</span>
                        <span>{product.brand}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
