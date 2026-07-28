import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/components/ProductCard';
import { StoreHero, StoreHeroSkeleton } from '@/components/store/StoreHero';
import { StoreCard } from '@/components/store/StoreCard';
import { StoreRating } from '@/components/store/StoreRating';
import { useCommerce } from '@/context/CommerceContext';
import type { Store, Product, Blog } from '@/lib/commerce-sdk';
import {
  Search,
  Package,
  BookOpen,
  Star,
  Mail,
  Phone,
  Globe,
  MapPin,
  Truck,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Briefcase,
  MessageSquare,
  ShoppingBag,
  ArrowLeft,
  Store as StoreIcon,
  X,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Quote,
} from 'lucide-react';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'rating';
type TabKey = 'products' | 'blog' | 'about' | 'reviews';

const PAGE_SIZE = 8;

interface StoreReview {
  id: string;
  rating?: number;
  comment?: string;
  reviewerName?: string;
  reviewer?: string;
  user?: { name?: string };
  createdAt?: string;
  productId?: string;
}

export default function StoreDetail() {
  // The /stores/:slug route exposes `slug`, while the catch-all /:storeSlug
  // route exposes `storeSlug`. Read both so the storefront works either way
  // without touching App.tsx (which is owned by the orchestrator).
  const params = useParams<{ slug?: string; storeSlug?: string }>();
  const storeSlug = params.slug || params.storeSlug;
  const { sdk, convertCurrency, currency } = useCommerce();

  const [store, setStore] = useState<Store | null>(null);
  const [otherStores, setOtherStores] = useState<Store[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ---- Load store + related data ----
  useEffect(() => {
    let alive = true;
    if (!sdk || !storeSlug) return;

    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        setStore(null);
        setRawProducts([]);
        setBlogPosts([]);
        setReviews([]);
        setVisibleCount(PAGE_SIZE);

        let storeData: Store | undefined = await sdk.getStoreBySlug(storeSlug);
        if (!storeData) {
          // Fallback: try by ID for backward compatibility.
          try {
            storeData = (await sdk.getStore(storeSlug)) as Store;
          } catch {
            storeData = undefined;
          }
        }

        if (!alive) return;

        if (!storeData || !(storeData.isApproved && storeData.isActive)) {
          setStore(null);
          return;
        }
        setStore(storeData);

        // Load products, blog posts, reviews, and other stores in parallel.
        const [productsData, blogData, reviewData, allStores] = await Promise.all([
          sdk.getStoreProducts(storeData.id).catch(() => [] as Product[]),
          sdk.getStoreBlogPosts(storeData.id).catch(() => [] as Blog[]),
          sdk.getStoreReviews(storeData.id).catch(() => [] as StoreReview[]),
          sdk.getStores().catch(() => [] as Store[]),
        ]);

        if (!alive) return;

        // Only show active products.
        setRawProducts((productsData as Product[]).filter((p) => p && p.isActive !== false));
        setBlogPosts((blogData as Blog[]).filter((b) => b && b.isPublished));
        setReviews((reviewData as StoreReview[]) || []);

        const others = (allStores as Store[])
          .filter(
            (s) =>
              s &&
              s.id !== storeData!.id &&
              s.isApproved &&
              s.isActive,
          )
          .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
          .slice(0, 4);
        setOtherStores(others);
      } catch (err: unknown) {
        if (!alive) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load this store.';
        setLoadError(message);
        setStore(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [sdk, storeSlug]);

  // Reset pagination when filters change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, categoryFilter, sortBy, storeSlug]);

  // ---- Currency-convert product prices for display ----
  // `convertCurrency` is recreated by context whenever currency changes, so
  // depending on it keeps prices in sync with the active currency.
  const products = useMemo<Product[]>(() => {
    return rawProducts.map((p) => ({
      ...p,
      price: convertCurrency(Number(p.price) || 0),
      originalPrice: p.originalPrice
        ? convertCurrency(Number(p.originalPrice) || 0)
        : undefined,
      shippingCost: p.shippingCost
        ? convertCurrency(Number(p.shippingCost) || 0)
        : undefined,
    }));
  }, [rawProducts, convertCurrency]);

  // ---- All categories in this store's catalog ----
  const catalogCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // ---- Apply search, filter, sort ----
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (
        categoryFilter !== 'all' &&
        p.category &&
        p.category !== categoryFilter
      )
        return false;
      if (q) {
        // `brand` exists on the runtime product shape but is not on the TS
        // Product interface; read it defensively so the build stays clean.
        const brand = readBrand(p);
        const haystack = [p.name, p.description, brand, ...(p.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return Number(a.price || 0) - Number(b.price || 0);
        case 'price-desc':
          return Number(b.price || 0) - Number(a.price || 0);
        case 'rating':
          return Number(b.rating || 0) - Number(a.rating || 0);
        case 'newest':
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });
    return list;
  }, [products, searchQuery, categoryFilter, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // ---- Reviews aggregation ----
  const reviewSummary = useMemo(() => {
    const validReviews = reviews.filter((r) => Number(r.rating || 0) > 0);
    const total = validReviews.length;
    const avg =
      total > 0
        ? validReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total
        : Number(store?.rating || 0);
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = validReviews.filter((r) => Math.round(Number(r.rating || 0)) === star).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { star, count, pct };
    });
    const totalReviewCount =
      Number(store?.reviewCount || 0) > 0
        ? Number(store?.reviewCount || 0)
        : total;
    return { avg, total, distribution, totalReviewCount };
  }, [reviews, store]);

  // ---- Render ----

  if (isLoading) {
    return (
      <Shell>
        <StoreHeroSkeleton />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-6 h-10 w-full max-w-md" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-16">
          <div
            role="alert"
            className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <StoreIcon className="h-8 w-8 text-destructive" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Could not load this store
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5"
            >
              Try again
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  if (!store) {
    return (
      <Shell>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Store not found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The store you&rsquo;re looking for doesn&rsquo;t exist, may have been
              removed, or isn&rsquo;t approved yet.
            </p>
            <Link to="/stores">
              <Button type="button" className="mt-5 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse all stores
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <StoreHero store={store} productCount={products.length} />

      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* ---- Quick info chips bar ---- */}
        <section
          aria-label="Store quick facts"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
        >
          <InfoChip
            icon={<Package className="h-4 w-4" />}
            label="Products"
            value={products.length.toLocaleString()}
          />
          <InfoChip
            icon={<Star className="h-4 w-4" />}
            label="Rating"
            value={
              Number(store.rating || 0) > 0
                ? `${Number(store.rating).toFixed(1)} / 5`
                : '—'
            }
          />
          <InfoChip
            icon={<MessageSquare className="h-4 w-4" />}
            label="Reviews"
            value={Number(store.reviewCount || reviewSummary.total).toLocaleString()}
          />
          {store.location && (
            <InfoChip
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={store.location}
            />
          )}
          {store.established && (
            <InfoChip
              icon={<Calendar className="h-4 w-4" />}
              label="Established"
              value={store.established}
            />
          )}
          {store.businessType && (
            <InfoChip
              icon={<Briefcase className="h-4 w-4" />}
              label="Business"
              value={store.businessType}
            />
          )}
        </section>

        {/* ---- Tabs ---- */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="w-full"
        >
          <TabsList
            className="grid h-auto w-full grid-cols-2 sm:grid-cols-4"
            aria-label="Store sections"
          >
            <TabsTrigger value="products" className="gap-1.5 py-2.5">
              <Package className="h-4 w-4" />
              Products
              <Badge
                variant="secondary"
                className="ml-1 bg-primary/10 text-primary"
              >
                {products.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5 py-2.5">
              <BookOpen className="h-4 w-4" />
              Blog
              <Badge
                variant="secondary"
                className="ml-1 bg-primary/10 text-primary"
              >
                {blogPosts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5 py-2.5">
              About
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5 py-2.5">
              Reviews
              <Badge
                variant="secondary"
                className="ml-1 bg-primary/10 text-primary"
              >
                {reviewSummary.totalReviewCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ---------- PRODUCTS ---------- */}
          <TabsContent value="products" className="mt-6">
            {/* Filter / search / sort row */}
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products in this store..."
                  aria-label="Search products in this store"
                  className="h-11 rounded-xl pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {catalogCategories.length > 0 && (
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-11 w-[170px] rounded-xl" aria-label="Filter by category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {catalogCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger className="h-11 w-[170px] rounded-xl" aria-label="Sort products">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {products.length === 0 ? (
              <EmptyProducts />
            ) : filteredProducts.length === 0 ? (
              <EmptyProducts
                title="No products match your search"
                description="Try adjusting your search terms or category filter."
                onReset={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing {visibleProducts.length} of {filteredProducts.length}{' '}
                  product{filteredProducts.length === 1 ? '' : 's'}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        setVisibleCount((c) => c + PAGE_SIZE)
                      }
                      className="gap-2"
                    >
                      Show more products
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ---------- BLOG ---------- */}
          <TabsContent value="blog" className="mt-6">
            {blogPosts.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No blog posts yet"
                description="This store hasn't published any blog posts. Check back later for updates, stories, and product news."
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {blogPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---------- ABOUT ---------- */}
          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* About text */}
              <Card className="lg:col-span-2">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">
                    About {store.name}
                  </h2>
                  {store.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {store.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      This store hasn&rsquo;t added a description yet.
                    </p>
                  )}

                  {/* Categories */}
                  {store.categories && store.categories.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Categories
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {store.categories.map((c) => (
                          <Badge
                            key={c}
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-primary"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {store.tags && store.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Tags
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {store.tags.map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact + social */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-foreground">Contact</h3>
                    <ul className="mt-3 space-y-3 text-sm">
                      {store.email && (
                        <li>
                          <a
                            href={`mailto:${store.email}`}
                            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{store.email}</span>
                          </a>
                        </li>
                      )}
                      {store.phone && (
                        <li>
                          <a
                            href={`tel:${store.phone}`}
                            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                          >
                            <Phone className="h-4 w-4" />
                            <span>{store.phone}</span>
                          </a>
                        </li>
                      )}
                      {store.website && (
                        <li>
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="truncate">
                              {normalizeWebsiteLabel(store.website)}
                            </span>
                          </a>
                        </li>
                      )}
                      {store.location && (
                        <li className="inline-flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{store.location}</span>
                        </li>
                      )}
                      {!store.email && !store.phone && !store.website && !store.location && (
                        <li className="text-muted-foreground">
                          No contact details provided.
                        </li>
                      )}
                    </ul>

                    {/* Social media */}
                    {store.socialMedia &&
                      Object.values(store.socialMedia).some(Boolean) && (
                        <div className="mt-5">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Follow
                          </h4>
                          <div className="mt-2 flex gap-2">
                            {store.socialMedia.facebook && (
                              <SocialButton
                                href={store.socialMedia.facebook}
                                label="Facebook"
                              >
                                <Facebook className="h-4 w-4" />
                              </SocialButton>
                            )}
                            {store.socialMedia.twitter && (
                              <SocialButton
                                href={store.socialMedia.twitter}
                                label="Twitter / X"
                              >
                                <Twitter className="h-4 w-4" />
                              </SocialButton>
                            )}
                            {store.socialMedia.instagram && (
                              <SocialButton
                                href={store.socialMedia.instagram}
                                label="Instagram"
                              >
                                <Instagram className="h-4 w-4" />
                              </SocialButton>
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Policies */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-base font-bold text-foreground">Policies</h3>
                    <ul className="mt-3 space-y-4 text-sm">
                      <PolicyRow
                        icon={<Truck className="h-4 w-4" />}
                        label="Shipping"
                        text={store.policies?.shipping}
                      />
                      <PolicyRow
                        icon={<RefreshCw className="h-4 w-4" />}
                        label="Returns"
                        text={store.policies?.returns}
                      />
                      <PolicyRow
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Privacy"
                        text={store.policies?.privacy}
                      />
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ---------- REVIEWS ---------- */}
          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection summary={reviewSummary} reviews={reviews} />
          </TabsContent>
        </Tabs>

        {/* ---- Related stores ---- */}
        {otherStores.length > 0 && (
          <section
            aria-labelledby="related-stores-heading"
            className="mt-16 border-t border-border/60 pt-12"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  <StoreIcon className="h-3.5 w-3.5" />
                  Keep exploring
                </div>
                <h2
                  id="related-stores-heading"
                  className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                >
                  Explore more stores
                </h2>
              </div>
              <Link
                to="/stores"
                className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
              >
                View all stores <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {otherStores.map((s) => (
                <StoreCard key={s.id} store={s} hideCta />
              ))}
            </div>
          </section>
        )}
      </div>
      </Shell>
    );
}

// ----- Layout shell with header/footer -----

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ----- Local presentational helpers -----

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function PolicyRow({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text?: string;
}) {
  return (
    <li>
      <div className="inline-flex items-center gap-2 text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <p className="mt-1 pl-9 text-muted-foreground">
        {text || 'This store has not published a policy yet.'}
      </p>
    </li>
  );
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
    >
      {children}
    </a>
  );
}

function BlogCard({ post }: { post: Blog }) {
  const [imgError, setImgError] = useState(false);
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const excerpt =
    post.excerpt || (post.content ? post.content.slice(0, 160) + '...' : '');

  return (
    <Card className="group h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="flex h-full flex-col sm:flex-row">
        {post.featuredImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted sm:h-auto sm:w-44 sm:shrink-0">
            {!imgError ? (
              <img
                src={post.featuredImage}
                alt=""
                aria-hidden
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(158 64% 40% / 0.5), hsl(32 95% 50% / 0.5))',
                }}
              />
            )}
          </div>
        )}
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {post.category && (
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                {post.category}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {post.author || 'Unknown author'}
            </span>
            <span>{readMinutes} min read</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function ReviewsSection({
  summary,
  reviews,
}: {
  summary: {
    avg: number;
    total: number;
    distribution: { star: number; count: number; pct: number }[];
    totalReviewCount: number;
  };
  reviews: StoreReview[];
}) {
  const shown = reviews.slice(0, 12);
  const avg = summary.avg;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Summary */}
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center">
          <p className="text-5xl font-extrabold leading-none text-foreground">
            {avg.toFixed(1)}
          </p>
          <div className="mt-2 flex justify-center">
            <StoreRating
              rating={avg}
              showCount={false}
              size={18}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on {summary.totalReviewCount.toLocaleString()} review
            {summary.totalReviewCount === 1 ? '' : 's'}
          </p>

          <div className="mt-5 space-y-2 text-left">
            {summary.distribution.map((row) => (
              <div
                key={row.star}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="inline-flex w-8 items-center gap-1">
                  {row.star}
                  <Star className="h-3 w-3 fill-accent text-accent" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{row.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review list */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-foreground">
            What customers say
          </h3>
          {shown.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center">
              <Quote className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No reviews yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reviews from this store&rsquo;s customers will appear here once
                they are submitted.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {shown.map((r) => (
                <li key={r.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(r.reviewerName ||
                          r.reviewer ||
                          r.user?.name ||
                          'A'
                        ).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {r.reviewerName ||
                            r.reviewer ||
                            r.user?.name ||
                            'Anonymous'}
                        </p>
                        {r.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {Number(r.rating || 0) > 0 && (
                      <StoreRating
                        rating={Number(r.rating)}
                        showCount={false}
                        size={14}
                      />
                    )}
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyProducts({
  title = 'No products yet',
  description = "This store hasn't added any products yet. Check back soon or browse other stores.",
  onReset,
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
}) {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8" />}
      title={title}
      description={description}
      action={
        onReset ? (
          <Button type="button" variant="outline" onClick={onReset} className="mt-5 gap-2">
            <X className="h-4 w-4" />
            Reset filters
          </Button>
        ) : undefined
      }
    />
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

function normalizeWebsiteLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** `brand` is present on the runtime Product shape but not on the TS type. */
function readBrand(product: Product): string | undefined {
  const value = (product as unknown as Record<string, unknown>).brand;
  return typeof value === 'string' ? value : undefined;
}
