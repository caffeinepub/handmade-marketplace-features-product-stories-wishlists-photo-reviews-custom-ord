import { useParams } from '@tanstack/react-router';
import { useGetProducts, useGetCategories } from '../hooks/useQueries';
import { BackendErrorNotice } from '../components/BackendErrorNotice';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/ui/skeleton';

export function CategoryPage() {
  const { categoryId } = useParams({ from: '/category/$categoryId' });
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch } = useGetProducts();
  const { data: categories = [] } = useGetCategories();

  const category = categories.find((c) => c.id.toString() === categoryId);
  const categoryProducts = products.filter((p) => p.tags.includes(category?.name || ''));

  if (!category && !productsLoading) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{category?.name || 'Category'}</h1>
        <p className="text-muted-foreground">
          {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'} available
        </p>
      </div>

      {productsError && (
        <BackendErrorNotice error={productsError as Error} onRetry={refetch} title="Failed to load products" />
      )}

      {productsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      ) : categoryProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}
