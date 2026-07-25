import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/commerce-sdk';
import { ChevronRight, Sparkles } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * Featured products grid. `isFeatured` products, "View All" -> /products?featured=true.
 */
export function FeaturedProducts({ products, isLoading = false }: FeaturedProductsProps) {
  const featured = React.useMemo(
    () => (products || []).filter((p) => p.isFeatured).slice(0, 8),
    [products]
  );

  return (
    <section aria-labelledby="featured-heading" className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Hand-picked
            </div>
            <h2
              id="featured-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Featured products
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Top picks from our verified sellers, chosen just for you.
            </p>
          </div>
          <Link
            to="/products?featured=true"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : featured.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-4 sm:hidden">
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">No featured products yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Browse the full catalog to discover great products.
      </p>
      <Link
        to="/products"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Browse all products <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default FeaturedProducts;
