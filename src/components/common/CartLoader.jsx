import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import cartAPI from '../../api/cart.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const CartLoader = () => {
  const { isAuthenticated } = useAuthStore();
  const { setCart, clearCart } = useCartStore();

  // Fetch cart when user is authenticated
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getCart(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync with store when data changes
  useEffect(() => {
    if (data?.data?.cart) {
      setCart(data.data.cart);
    }
  }, [data, setCart]);

  // Clear cart on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearCart();
    }
  }, [isAuthenticated, clearCart]);

  return null;
};

export default CartLoader;
