import { Link } from '@tanstack/react-router';
import { Card, CardContent } from './ui/card';
import type { Category } from '../backend';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to="/category/$categoryId" params={{ categoryId: category.id.toString() }}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold">{category.name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}
