import { useParams } from '@tanstack/react-router';
import { useGetShops, useGetProducts } from '../hooks/useQueries';
import { BackendErrorNotice } from '../components/BackendErrorNotice';
import { ProductCard } from '../components/ProductCard';
import { CustomOrderButton } from '../components/CustomOrderButton';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Megaphone } from 'lucide-react';

export function ShopPage() {
  const { shopId } = useParams({ from: '/shop/$shopId' });
  const { data: shops = [], isLoading: shopsLoading, error: shopsError, refetch: refetchShops } = useGetShops();
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useGetProducts();

  const shop = shops.find((s) => s.id.toString() === shopId);
  const shopProducts = products.filter((p) => p.shopId.toString() === shopId);

  if (shopsLoading || productsLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (shopsError) {
    return (
      <div className="container py-8">
        <BackendErrorNotice error={shopsError as Error} onRetry={refetchShops} title="Failed to load shop" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
        <p className="text-muted-foreground">The shop you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Shop Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{shop.name}</h1>
            <p className="text-muted-foreground max-w-2xl">{shop.description}</p>
          </div>
          <CustomOrderButton shopId={shop.id} />
        </div>

        {/* Announcements */}
        {shop.announcements.length > 0 && (
          <Alert className="bg-primary/5 border-primary/20">
            <Megaphone className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                {shop.announcements.map((announcement, index) => (
                  <p key={index} className="text-sm">
                    {announcement}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Shop Products */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Products</h2>

        {productsError && (
          <BackendErrorNotice error={productsError as Error} onRetry={refetchProducts} title="Failed to load products" />
        )}

        {shopProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shopProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
