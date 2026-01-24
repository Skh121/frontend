import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI } from '../../api/cart.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: () => cartAPI.addToCart(product._id, 1),
    onSuccess: (response) => {
      setCart(response.data.cart);
      queryClient.invalidateQueries(['cart']);
      alert('Product added to cart!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <Link to={`/products/${product._id}`}>
        <div className="relative h-48 bg-gray-200">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
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

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 truncate">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCartMutation.isPending}
          className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {addToCartMutation.isPending ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
