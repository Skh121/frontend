import { create } from 'zustand';

const useCartStore = create((set) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,

  setCart: (cart) => {
    const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    set({ cart, itemCount });
  },

  clearCart: () => set({ cart: null, itemCount: 0 }),

  setLoading: (isLoading) => set({ isLoading }),

  updateItemCount: (count) => set({ itemCount: count }),
}));

export default useCartStore;
