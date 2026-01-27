import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { favoritesAPI } from '../../api/favorites.api';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';

const FavoritesLoader = () => {
  const { isAuthenticated } = useAuthStore();
  const { setFavorites, clearFavorites } = useFavoritesStore();

  // Fetch favorites when user is authenticated
  const { data } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getFavorites(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data?.data?.products) {
      setFavorites(data.data.products);
    }
  }, [data, setFavorites]);

  // Proactively clear favorites if user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearFavorites();
    }
  }, [isAuthenticated, clearFavorites]);

  return null;
};

export default FavoritesLoader;
