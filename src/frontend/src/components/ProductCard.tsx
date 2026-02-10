import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, X } from 'lucide-react';
import { useRemoveFromWishlist } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../backend';
import { useMemo } from 'react';

interface ProductCardProps {
  product: Product;
  showRemoveFromWishlist?: boolean;
}

export function ProductCard({ product, showRemoveFromWishlist }: ProductCardProps) {
  const removeFromWishlist = useRemoveFromWishlist();

  const imageUrl = useMemo(() => {
    if (product.image) {
      const blob = new Blob([new Uint8Array(product.image)], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    return null;
  }, [product.image]);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await removeFromWishlist.mutateAsync(product.id);
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  };

  return (
    <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-square relative bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {showRemoveFromWishlist && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={removeFromWishlist.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardContent className="flex-1 p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-lg font-semibold text-primary">${(Number(product.price) / 100).toFixed(2)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
