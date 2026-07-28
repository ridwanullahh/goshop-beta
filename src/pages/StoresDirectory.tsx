import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { Store } from '@/lib/commerce-sdk';
import { StoreCard, StoreCardSkeleton } from '@/components/store/StoreCard';
import {
  Search,
  Store as StoreIcon,
  Package,
  Star,
  ShoppingBag,
  X,
  SlidersHorizontal,
  TrendingUp,
  BadgeCheck,
} from 'lucide-react';

type SortKey = 'rating' | 'products' | 'name' | 'newest';

/** Catalog filter options (besides "All"). */
type FilterKey = 'all' | 'verified' | 'new';

const NEW_STORE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export default function StoresDirectory() {
  const { sdk } = useCommerce();

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterKey>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  // ---- Load all approved/active stores once ----
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sdk) return;
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = (await sdk.getStores()) as Store[];
        if (!alive) return;
        const visible = (data || []).filter(
          (s) => s && s.isApproved && s.isActive,
        );
        setStores(visible);
      } catch (err: unknown) {
        if (!alive) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load stores.';
        setLoadError(message);
        setStores([]);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sdk]);

  // ---- All categories present across visible stores ----
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => (s.categories || []).forEach((c) => set.add(c)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [stores]);

  // ---- Derived stats ----
  const stats = useMemo(() => {
    const totalStores = stores.length;
    const totalProducts = stores.reduce(
      (sum, s) => sum + Number(s.productCount || 0),
      0,
    );
    const rated = stores.filter((s) => Number(s.rating || 0) > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + Number(s.rating || 0), 0) / rated.length
        : 0;
    const verifiedCount = stores.filter(
      (s) => s.isVerified || s.isApproved,
    ).length;
    return { totalStores, totalProducts, avgRating, verifiedCount };
  }, [stores]);

  // ---- Apply search, filters, sort ----
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = stores.filter((store) => {
      // search
      if (q) {
        const haystack = [
          store.name,
          store.description,
          store.location,
          store.businessType,
          ...(store.categories || []),
          ...(store.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // quick filter
      if (filterBy === 'verified' && !(store.isVerified || store.isApproved))
        return false;
      if (filterBy === 'new') {
        const created = store.createdAt ? new Date(store.createdAt).getTime() : 0;
        if (Date.now() - created > NEW_STORE_WINDOW_MS) return false;
      }

      // category filter
      if (
        categoryFilter !== 'all' &&
        !(store.categories || []).includes(categoryFilter)
      )
        return false;

      return true;
    });

    list = list.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return Number(b.rating || 0) - Number(a.rating || 0);
        case 'products':
          return Number(b.productCount || 0) - Number(a.productCount || 0);
        case 'newest':
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return list;
  }, [stores, searchQuery, filterBy, categoryFilter, sortBy]);

  const hasActiveFilters =
    !!searchQuery.trim() || filterBy !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setCategoryFilter('all');
    setSortBy('rating');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ---- Hero ---- */}
        <section
          aria-labelledby="stores-hero-heading"
          className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background"
        >
          {/* Decorative background pattern (no extra DOM cost). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(158 64% 40% / 0.08) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <StoreIcon className="h-3.5 w-3.5" />
                Marketplace stores
              </div>
              <h1
                id="stores-hero-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                Discover Amazing Stores
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Explore verified sellers and unique brands from around the world.
                Find trusted shops with quality products, fast shipping, and
                top-rated service.
              </p>
            </div>

            {/* Search + filters */}
            <div className="mx-auto mt-8 max-w-4xl space-y-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by store name, description, location, or category..."
                  aria-label="Search stores"
                  className="h-12 rounded-2xl border-border/70 bg-background pl-12 pr-4 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterKey)}>
                    <SelectTrigger className="h-10 w-[150px] rounded-xl" aria-label="Quick filter">
                      <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stores</SelectItem>
                      <SelectItem value="verified">Verified only</SelectItem>
                      <SelectItem value="new">New stores</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-10 w-[170px] rounded-xl" aria-label="Filter by category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {allCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-10 gap-1 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                    Sort by
                  </span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                    <SelectTrigger className="h-10 w-[170px] rounded-xl" aria-label="Sort stores">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">
                        <span className="inline-flex items-center gap-2">
                          <Star className="h-4 w-4" /> Highest rated
                        </span>
                      </SelectItem>
                      <SelectItem value="products">
                        <span className="inline-flex items-center gap-2">
                          <Package className="h-4 w-4" /> Most products
                        </span>
                      </SelectItem>
                      <SelectItem value="newest">
                        <span className="inline-flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Newest
                        </span>
                      </SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 sm:py-12">
          {/* ---- Stats strip ---- */}
          <section
            aria-label="Stores overview"
            className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            <StatCard
              icon={<StoreIcon className="h-5 w-5" />}
              label="Active stores"
              value={isLoading ? '—' : stats.totalStores.toLocaleString()}
              accent="primary"
            />
            <StatCard
              icon={<Package className="h-5 w-5" />}
              label="Total products"
              value={isLoading ? '—' : stats.totalProducts.toLocaleString()}
              accent="primary"
            />
            <StatCard
              icon={<Star className="h-5 w-5" />}
              label="Average rating"
              value={
                isLoading
                  ? '—'
                  : stats.avgRating > 0
                    ? `${stats.avgRating.toFixed(1)} / 5`
                    : '—'
              }
              accent="amber"
            />
            <StatCard
              icon={<BadgeCheck className="h-5 w-5" />}
              label="Verified sellers"
              value={isLoading ? '—' : stats.verifiedCount.toLocaleString()}
              accent="primary"
            />
          </section>

          {/* ---- Results header ---- */}
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isLoading
                ? 'Loading stores...'
                : `${filteredStores.length} store${filteredStores.length === 1 ? '' : 's'} found`}
            </h2>
            {!isLoading && filteredStores.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredStores.length} of {stores.length}
              </p>
            )}
          </div>

          {/* ---- Store grid ---- */}
          {isLoading ? (
            <div
              role="status"
              aria-live="polite"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <StoreCardSkeleton key={i} />
              ))}
            </div>
          ) : loadError ? (
            <ErrorState message={loadError} onRetry={() => window.location.reload()} />
          ) : filteredStores.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}

          {/* ---- SEO footer blurb ---- */}
          {!isLoading && filteredStores.length > 0 && (
            <section
              aria-label="About GoShop stores"
              className="mt-16 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Why shop from GoShop stores?
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Every store on GoShop is reviewed and approved before publishing.
                Look for the <span className="font-semibold text-primary">Verified</span>{' '}
                badge for sellers we have vetted, and check each store&rsquo;s
                rating, product count, and policies directly on their storefront.
                Have a question? Use the contact details listed on each store
                page to reach the seller directly.
              </p>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ----- Local helper components -----

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'primary' | 'amber';
}) {
  const isAmber = accent === 'amber';
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4 sm:p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isAmber
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
              : 'bg-primary/10 text-primary'
          }`}
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
            {value}
          </p>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">No stores found</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? 'No stores match your current search or filters. Try adjusting your criteria or clear all filters to see every store.'
          : 'There are no approved stores available right now. Please check back soon.'}
      </p>
      {hasFilters && (
        <Button type="button" onClick={onClear} className="mt-5 gap-2">
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}
      <Link
        to="/"
        className="mt-3 text-sm font-medium text-primary hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <StoreIcon className="h-8 w-8 text-destructive" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">
        Could not load stores
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button type="button" onClick={onRetry} className="mt-5">
        Try again
      </Button>
    </div>
  );
}
