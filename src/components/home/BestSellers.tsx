import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/commerce-sdk';
import { ChevronRight, TrendingUp } from 'lucide-react';

interface BestSellersProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * Best sellers / trending: sorted by soldCount desc, top 8.
 */
export function BestSellers({ products, isLoading = false }: BestSellersProps) {
  const trending = React.useMemo(
    () =>
      (products || [])
        .slice()
        .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
        .slice(0, 8),
    [products]
  );

  return (
    <section
      aria-labelledby="bestsellers-heading"
      className="border-t bg-muted/30 py-12 sm:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              Trending now
            </div>
            <h2
              id="bestsellers-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Best sellers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The most-loved products by shoppers like you.
            </p>
          </div>
          <Link
            to="/products?sort=bestselling"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <BestSellersSkeleton />
        ) : trending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No trending data available yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Best sellers will surface here once products start selling.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {trending.map((p, i) => (
              <div key={p.id} className="relative">
                {i < 3 && (
                  <span className="absolute -left-1 -top-1 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow-md ring-2 ring-background">
                    #{i + 1}
                  </span>
                )}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BestSellersSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
      ))}
    </div>
  );
}

export default BestSellers;
