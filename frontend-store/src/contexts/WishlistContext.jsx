import { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';
import { useAuthStore } from '../store';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => usersApi.getWishlist().then((r) => r.data.data),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const toggleMutation = useMutation({
    mutationFn: ({ productId, isWishlisted }) =>
      isWishlisted
        ? usersApi.removeWishlist(productId).then((r) => r.data)
        : usersApi.addToWishlist(productId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    },
  });

  const value = useMemo(() => {
    const isWishlisted = (productId) => wishlist.some((item) => item.productId === productId);
    const wishlistCount = wishlist.length;
    return {
      wishlist,
      isLoading,
      error,
      isWishlisted,
      wishlistCount,
      toggleWishlist: toggleMutation.mutateAsync,
      isPending: toggleMutation.isPending,
    };
  }, [wishlist, isLoading, error, toggleMutation.mutateAsync, toggleMutation.isPending]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
