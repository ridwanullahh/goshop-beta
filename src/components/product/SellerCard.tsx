import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, BadgeCheck, Star, MapPin, ArrowRight } from 'lucide-react';

export interface SellerCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    rating?: number;
    reviewCount?: number;
    productCount?: number;
    isVerified?: boolean;
    location?: string;
    description?: string;
  } | null;
  loading?: boolean;
}

/**
 * Compact seller/store card linking to /stores/:slug.
 *
 * - Store logo (fallback to a Store icon tile).
 * - Name, verified badge, location.
 * - Rating + review count + product count.
 * - "Visit Store" CTA on the right.
 */
export function SellerCard({ store, loading = false }: SellerCardProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!store) return null;

  const rating = Number(store.rating || 0);
  const reviewCount = Number(store.reviewCount || 0);
  const productCount = Number(store.productCount || 0);

  return (
    <Card className="border-border/60 bg-card/80 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Store className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                {store.name}
              </h3>
              {store.isVerified && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/40 bg-primary/5 px-1.5 text-[10px] font-medium text-primary"
                  title="Verified seller"
                >
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">
                    {rating.toFixed(1)}
                  </span>
                  <span>({reviewCount.toLocaleString()})</span>
                </span>
              )}
              {productCount > 0 && (
                <span>{productCount.toLocaleString()} products</span>
              )}
              {store.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store.location}
                </span>
              )}
            </div>

            {store.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {store.description}
              </p>
            )}
          </div>
        </div>

        <div className="sm:ml-auto">
          <Button asChild variant="outline" className="gap-1.5">
            <Link to={`/stores/${store.slug}`}>
              Visit Store
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SellerCard;
