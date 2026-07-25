import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { Store } from '@/lib/commerce-sdk';
import { ChevronRight, Star, MapPin, Package, BadgeCheck, Store as StoreIcon } from 'lucide-react';

/**
 * Top stores: verified stores with logo, name, rating, productCount, location.
 * Fetches via sdk.getStores(). Link to /stores/:slug. "View All Stores" -> /stores.
 */
export function TopStores() {
  const { sdk, isLoading: ctxLoading } = useCommerce();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = (await sdk.getStores()) as Store[];
        if (!alive) return;
        setStores(data || []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sdk]);

  const isLoading = ctxLoading || loading;

  const top = React.useMemo(
    () =>
      (stores || [])
        .filter((s) => s.isVerified || s.isApproved)
        .sort((a, b) => Number(b.productCount || 0) - Number(a.productCount || 0))
        .slice(0, 6),
    [stores]
  );

  return (
    <section aria-labelledby="stores-heading" className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <StoreIcon className="h-3.5 w-3.5" />
              Verified sellers
            </div>
            <h2
              id="stores-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Top stores
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Trusted sellers with the best products and ratings.
            </p>
          </div>
          <Link
            to="/stores"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            View all stores <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <TopStoresSkeleton />
        ) : top.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No verified stores yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified seller storefronts will appear here soon.
            </p>
            <Link
              to="/stores"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse all stores <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StoreCard({ store }: { store: Store }) {
  const rating = Number(store.rating || 0);
  return (
    <Link
      to={`/stores/${encodeURIComponent(store.slug)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Banner */}
      <div className="relative h-24 w-full overflow-hidden bg-muted">
        {store.banner ? (
          <img
            src={store.banner}
            alt=""
            aria-hidden
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, hsl(158 64% 40% / 0.85), hsl(32 95% 50% / 0.85))',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Logo + info */}
      <div className="relative -mt-9 flex items-end gap-3 px-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-4 border-card bg-muted shadow-sm">
          {store.logo ? (
            <img
              src={store.logo}
              alt={`${store.name} logo`}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-bold text-primary">
              {store.name?.charAt(0) || 'S'}
            </div>
          )}
        </div>
        {(store.isVerified || store.isApproved) && (
          <Badge
            className="mb-1 gap-1 bg-primary text-primary-foreground"
            title="Verified seller"
          >
            <BadgeCheck className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-3">
        <h3 className="line-clamp-1 text-base font-bold text-foreground group-hover:text-primary">
          {store.name}
        </h3>

        {store.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {store.description}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {rating > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {rating.toFixed(1)}
              <span className="text-muted-foreground">
                ({Number(store.reviewCount || 0).toLocaleString()})
              </span>
            </span>
          )}
          {Number(store.productCount || 0) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {Number(store.productCount).toLocaleString()} products
            </span>
          )}
          {store.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {store.location}
            </span>
          )}
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Visit store
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function TopStoresSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default TopStores;
