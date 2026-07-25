import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/commerce-sdk';
import { Clock, Flame, ChevronRight } from 'lucide-react';

interface DealsSectionProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * Flash Deals / Today's Deals: products with discount > 0.
 * - Static "Ends soon" ribbon (no fake timer logic).
 * - Horizontal rail on mobile, responsive grid on larger screens.
 */
export function DealsSection({ products, isLoading = false }: DealsSectionProps) {
  const deals = React.useMemo(
    () =>
      (products || [])
        .filter(
          (p) =>
            (p.discount && Number(p.discount) > 0) ||
            (p.originalPrice && Number(p.originalPrice) > Number(p.price))
        )
        .sort(
          (a, b) =>
            (Number(b.discount) ||
              (Number(b.originalPrice) - Number(b.price)) /
                Math.max(Number(b.originalPrice), 1) * 100) -
            (Number(a.discount) ||
              (Number(a.originalPrice) - Number(a.price)) /
                Math.max(Number(a.originalPrice), 1) * 100)
        )
        .slice(0, 8),
    [products]
  );

  return (
    <section
      aria-labelledby="deals-heading"
      className="relative isolate overflow-hidden border-y border-amber-500/15 bg-gradient-to-br from-amber-50 via-background to-foreground/[0.02] py-12 sm:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
              <Flame className="h-3.5 w-3.5" />
              Flash Deals
            </div>
            <h2
              id="deals-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Today&apos;s Deals
            </h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" />
              Limited time — ends soon
            </p>
          </div>
          <Link
            to="/products?deals=true"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all deals <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <DealsSkeleton />
        ) : deals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No active deals right now
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back soon for unbeatable prices on top products.
            </p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse all products <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => (
              <div
                key={p.id}
                className="w-[260px] shrink-0 sm:w-auto"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
      ))}
    </div>
  );
}

export default DealsSection;
