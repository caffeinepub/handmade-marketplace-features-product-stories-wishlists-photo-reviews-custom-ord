import { useGetProducts, useGetCategories, useGetShops } from '../hooks/useQueries';
import { BackendErrorNotice } from '../components/BackendErrorNotice';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { Button } from '../components/ui/button';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '../components/ui/skeleton';

export function HomePage() {
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useGetProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useGetCategories();
  const { data: shops = [], isLoading: shopsLoading } = useGetShops();

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover Handmade Treasures
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Support independent artisans and find unique, handcrafted items made with love and care.
        </p>
      </section>

      {/* Categories Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Browse by Category</h2>
        </div>

        {categoriesError && (
          <BackendErrorNotice error={categoriesError as Error} onRetry={refetchCategories} title="Failed to load categories" />
        )}

        {categoriesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id.toString()} category={category} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No categories available yet.</p>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Products</h2>
        </div>

        {productsError && (
          <BackendErrorNotice error={productsError as Error} onRetry={refetchProducts} title="Failed to load products" />
        )}

        {productsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No products available yet.</p>
            <p className="text-sm text-muted-foreground">Check back soon for handmade treasures!</p>
          </div>
        )}
      </section>

      {/* Shops Section */}
      {shops.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Featured Shops</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 3).map((shop) => (
              <Link
                key={shop.id.toString()}
                to="/shop/$shopId"
                params={{ shopId: shop.id.toString() }}
                className="block p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{shop.name}</h3>
                <p className="text-muted-foreground line-clamp-2">{shop.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
