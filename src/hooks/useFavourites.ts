import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

/**
 * Hook for favourite items (item_user): who liked which item.
 * Uses GET/POST/DELETE /api/me/favourites and /api/me/favourites/{item}.
 */
export function useFavourites() {
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    if (!token) {
      setFavouriteIds(new Set());
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await apiClient.get('/me/favourites', { params: { 'per-page': 100 } });
      const raw = res.data?.data ?? res.data?.favourites ?? res.data?.favorites ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      const ids = new Set(list.map((item: { id?: number }) => Number(item?.id)).filter(Boolean));
      setFavouriteIds(ids);
    } catch {
      setFavouriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const isFavourited = useCallback(
    (itemId: number) => favouriteIds.has(Number(itemId)),
    [favouriteIds]
  );

  const addFavourite = useCallback(
    async (itemId: number): Promise<{ success: boolean; message?: string }> => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (!token) return { success: false, message: 'Please log in to save favorites' };
      try {
        await apiClient.post(`/me/favourites/${itemId}`, {});
        setFavouriteIds((prev) => new Set([...prev, Number(itemId)]));
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.message || err.response?.data?.errors?.item?.[0] || 'Failed to add to favorites';
        return { success: false, message: msg };
      }
    },
    []
  );

  const removeFavourite = useCallback(
    async (itemId: number): Promise<{ success: boolean; message?: string }> => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
      if (!token) return { success: false, message: 'Please log in to save favorites' };
      try {
        await apiClient.delete(`/me/favourites/${itemId}`);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(Number(itemId));
          return next;
        });
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to remove from favorites';
        return { success: false, message: msg };
      }
    },
    []
  );

  const toggleFavourite = useCallback(
    async (itemId: number): Promise<{ success: boolean; message?: string }> => {
      const id = Number(itemId);
      if (favouriteIds.has(id)) return removeFavourite(id);
      return addFavourite(id);
    },
    [favouriteIds, addFavourite, removeFavourite]
  );

  return {
    favouriteIds: Array.from(favouriteIds),
    isFavourited,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    refetch: fetchFavourites,
    isLoading,
  };
}
