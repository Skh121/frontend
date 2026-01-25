import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import useFavoritesStore from "../../store/favoritesStore";
import authAPI from "../../api/auth.api";
import { SERVER_URL } from "../../utils/constants";

const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, clearUser } = useAuthStore();
  const { itemCount, clearCart } = useCartStore();
  const { favoriteIds, clearFavorites } = useFavoritesStore();

  const wishlistCount = favoriteIds.size;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // CRITICAL: Clear all user data to prevent data leakage between sessions
      clearUser(); // Clear auth store
      clearCart(); // Clear cart store
      clearFavorites(); // Clear favorites store
      queryClient.clear(); // Clear ALL React Query cache
      navigate("/");
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-300 flex items-center gap-2"
          >
            <span>🛍️</span> ShopSecure
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Products
            </Link>
            <Link
              to="/wishlist"
              className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Wishlist
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated && <>{/* Orders link removed as per request */}</>}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium sm:flex"
                >
                  {user?.profileImage ? (
                    <img
                      src={
                        user.profileImage.startsWith("/")
                          ? `${SERVER_URL}${user.profileImage}`
                          : user.profileImage
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      👤
                    </div>
                  )}
                  <span className="text-sm">
                    {user?.firstName || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-6 text-sm shadow-lg shadow-blue-500/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
