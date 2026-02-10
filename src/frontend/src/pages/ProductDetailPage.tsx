import { useParams, Link } from '@tanstack/react-router';
import { useGetProducts, useGetReviewsForProduct, useGetShops, useGetMyWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { BackendErrorNotice } from '../components/BackendErrorNotice';
import { ReviewSection } from '../components/ReviewSection';
import { CustomOrderButton } from '../components/CustomOrderButton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Heart, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';

export function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const { identity } = useInternetIdentity();
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch } = useGetProducts();
  const { data: shops = [] } = useGetShops();
  const { data: wishlist = [] } = useGetMyWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const product = products.find((p) => p.id.toString() === productId);
  const shop = product ? shops.find((s) => s.id === product.shopId) : undefined;
  const isInWishlist = product ? wishlist.some((id) => id === product.id) : false;

  const { data: reviews = [], isLoading: reviewsLoading } = useGetReviewsForProduct(product?.id);

  const imageUrl = useMemo(() => {
    if (product?.image) {
      const blob = new Blob([new Uint8Array(product.image)], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    return null;
  }, [product?.image]);

  const handleWishlistToggle = async () => {
    if (!identity) {
      toast.error('Please login to add items to your wishlist');
      return;
    }

    if (!product) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  if (productsLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container py-8">
        <BackendErrorNotice error={productsError as Error} onRetry={refetch} title="Failed to load product" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-12">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-semibold text-primary">${(Number(product.price) / 100).toFixed(2)}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-muted-foreground">{product.description}</p>

          <div className="flex gap-3">
            <Button
              onClick={handleWishlistToggle}
              variant={isInWishlist ? 'default' : 'outline'}
              className="flex-1"
              disabled={addToWishlist.isPending || removeFromWishlist.isPending}
            >
              <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </Button>
            <CustomOrderButton shopId={product.shopId} />
          </div>

          {shop && (
            <Link
              to="/shop/$shopId"
              params={{ shopId: shop.id.toString() }}
              className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <Store className="h-5 w-5" />
              <div>
                <p className="font-semibold">{shop.name}</p>
                <p className="text-sm text-muted-foreground">Visit shop</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Product Story */}
      {product.story && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">About This Item</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{product.story}</p>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection productId={product.id} reviews={reviews} isLoading={reviewsLoading} />
    </div>
  );
}
