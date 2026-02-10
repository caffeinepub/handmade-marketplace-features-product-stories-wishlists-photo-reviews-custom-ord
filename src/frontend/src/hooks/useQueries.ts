import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Shop, Category, Review, CustomOrderRequest, UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShops() {
  const { actor, isFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReviewsForProduct(productId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === undefined) return [];
      return actor.getReviewsForProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== undefined,
  });
}

export function useGetMyWishlist() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyWishlist();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addToWishlist(productId);
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.removeFromWishlist(productId);
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
      photos,
    }: {
      productId: bigint;
      rating: bigint;
      comment: string;
      photos: Uint8Array[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.addReview(productId, rating, comment, photos);
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId.toString()] });
    },
  });
}

export function useCreateCustomOrderRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, description }: { shopId: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCustomOrderRequest(shopId, description);
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customOrders'] });
    },
  });
}
