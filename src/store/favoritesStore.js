import { create } from 'zustand';

const useFavoritesStore = create((set) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,

  setFavorites: (products) => {
    const favoriteIds = new Set(products.map(p => p._id || p.id));
    set({ favorites: products, favoriteIds });
  },

  addFavorite: (productId) => {
    set((state) => ({
      favoriteIds: new Set([...state.favoriteIds, productId]),
    }));
  },

  removeFavorite: (productId) => {
    set((state) => {
      const newFavoriteIds = new Set(state.favoriteIds);
      newFavoriteIds.delete(productId);
      return {
        favoriteIds: newFavoriteIds,
        favorites: state.favorites.filter(p => (p._id || p.id) !== productId),
      };
    });
  },

  isFavorite: (productId) => {
    const state = useFavoritesStore.getState();
    return state.favoriteIds.has(productId);
  },

  clearFavorites: () => set({ favorites: [], favoriteIds: new Set() }),

  setLoading: (isLoading) => set({ isLoading }),
}));

export default useFavoritesStore;
