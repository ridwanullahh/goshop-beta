import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib';

export interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  category: string;
  /** Slug used by the "View all" link `/category/:slug`. */
  categorySlug?: string;
  loading?: boolean;
  /** Max number of related products to show. */
  limit?: number;
}

/**
 * Related products rail — uses the existing reusable ProductCard for visual
 * consistency across the storefront.
 */
export function RelatedProducts({
  products,
  currentProductId,
  category,
  categorySlug,
  loading = false,
  limit = 8,
}: RelatedProductsProps) {
  const related = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.id !== currentProductId &&
          p.category &&
          p.category.toLowerCase() === category.toLowerCase()
      )
      .slice(0, limit);
  }, [products, currentProductId, category, limit]);

  const viewAllHref = categorySlug
    ? `/category/${categorySlug}`
    : `/products?category=${encodeURIComponent(category)}`;

  if (!loading && related.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Related products
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            More from <span className="font-medium text-foreground">{category}</span>
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-primary">
          <Link to={viewAllHref}>
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-border/70">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardContent className="space-y-2 p-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RelatedProducts;
