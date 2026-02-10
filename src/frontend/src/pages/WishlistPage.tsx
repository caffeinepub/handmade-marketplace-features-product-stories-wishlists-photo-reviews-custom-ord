import { useGetMyWishlist, useGetProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BackendErrorNotice } from '../components/BackendErrorNotice';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Heart } from 'lucide-react';

export function WishlistPage() {
  const { identity, login } = useInternetIdentity();
  const { data: wishlist = [], isLoading: wishlistLoading, error: wishlistError, refetch: refetchWishlist } = useGetMyWishlist();
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useGetProducts();

  const wishlistProducts = products.filter((p) => wishlist.some((id) => id === p.id));

  if (!identity) {
    return (
      <div className="container py-12 text-center space-y-4">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Please login to view and manage your wishlist of favorite handmade items.
        </p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  if (wishlistLoading || productsLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="container py-8">
        <BackendErrorNotice error={wishlistError as Error} onRetry={refetchWishlist} title="Failed to load wishlist" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container py-8">
        <BackendErrorNotice error={productsError as Error} onRetry={refetchProducts} title="Failed to load products" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Your Wishlist</h1>
        <p className="text-muted-foreground">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id.toString()} product={product} showRemoveFromWishlist />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <p className="text-sm text-muted-foreground">Start adding items you love!</p>
        </div>
      )}
    </div>
  );
}
