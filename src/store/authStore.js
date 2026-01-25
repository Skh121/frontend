import { create } from 'zustand';
import { getItem, setItem, removeItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const useAuthStore = create((set) => ({
  user: getItem(STORAGE_KEYS.USER),
  isAuthenticated: !!getItem(STORAGE_KEYS.USER),
  isLoading: false,

  setUser: (user) => {
    setItem(STORAGE_KEYS.USER, user);
    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    removeItem(STORAGE_KEYS.USER);
    set({ user: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'admin';
  },

  logout: function () {
    this.clearUser();
    // Dynamically call other store clears if needed or handle in component
    // Here we just ensure the auth state is solid
  },
}));

// Add a subscriber to clear other stores when user becomes null
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (!user) {
      const { useCartStore } = import.meta.glob('./cartStore.js', { eager: true })['./cartStore.js'];
      const { useFavoritesStore } = import.meta.glob('./favoritesStore.js', { eager: true })['./favoritesStore.js'];

      if (useCartStore) useCartStore.getState().clearCart();
      if (useFavoritesStore) useFavoritesStore.getState().clearFavorites();
    }
  }
);

export { useAuthStore };
export default useAuthStore;
