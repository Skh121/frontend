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

  logout: async () => {
    const { clearUser } = useAuthStore.getState();
    clearUser();
    // Additional cleanup logic can be added here
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

// Sync across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.USER && !event.newValue) {
      useAuthStore.getState().clearUser();
    }
  });
}

export { useAuthStore };
export default useAuthStore;
