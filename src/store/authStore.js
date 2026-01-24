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
}));

export default useAuthStore;
