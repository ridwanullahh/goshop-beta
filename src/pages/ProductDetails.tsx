import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ReviewsSection, type Review } from '@/components/product/ReviewsSection';
import { SellerCard } from '@/components/product/SellerCard';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { useCommerce } from '@/context/CommerceContext';
import type { Product, ProductVariation } from '@/lib';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  ArrowLeft,
  Plus,
  Minus,
  Shield,
  Truck,
  RotateCcw,
  Store,
  Check,
  Flame,
  PackageCheck,
  Lock,
  ChevronRight,
  Package,
  Scale,
  Ruler,
  Tag,
} from 'lucide-react';

/** Build a category slug from a category name (fallback when no category record). */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    products,
    categories,
    isLoading: contextLoading,
    convertCurrency,
    currency,
    sdk,
    currentUser,
    addToCart,
    addToWishlist,
  } = useCommerce();

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [store, setStore] = useState<any | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);

  // UI state
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  /** Format a price using the active currency. */
  const formatPrice = useCallback(
    (amount: number) => {
      const safe = Number.isFinite(amount) ? amount : 0;
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency?.code || 'USD',
          maximumFractionDigits: 2,
        }).format(safe);
      } catch {
        return `${currency?.symbol || '$'}${safe.toFixed(2)}`;
      }
    },
    [currency?.code, currency?.symbol]
  );

  /** Resolve the product — prefer the context list (already currency-converted),
   *  fall back to a direct API fetch (and convert) when not in the list. */
  useEffect(() => {
    if (!id) {
      setProduct(null);
      setProductLoading(false);
      return;
    }

    const fromContext = products.find((p) => p.id === id);
    if (fromContext) {
      setProduct(fromContext);
      setProductLoading(false);
      return;
    }

    // If context is still loading, wait for it to avoid an unnecessary fetch.
    if (contextLoading) return;

    let cancelled = false;
    setProductLoading(true);
    (async () => {
      try {
        const raw = await sdk.getProduct(id);
        if (cancelled) return;
        if (!raw) {
          setProduct(null);
          return;
        }
        const converted: Product = {
          ...raw,
          price: convertCurrency(Number(raw.price) || 0),
          originalPrice: raw.originalPrice
            ? convertCurrency(Number(raw.originalPrice) || 0)
            : undefined,
        };
        setProduct(converted);
      } catch (err) {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, products, contextLoading, sdk, convertCurrency]);

  /** Fetch the store record once we have a storeId. */
  useEffect(() => {
    if (!product?.storeId) {
      setStore(null);
      return;
    }
    let cancelled = false;
    setStoreLoading(true);
    (async () => {
      try {
        const s = await sdk.getStore(product.storeId!);
        if (!cancelled) setStore(s || null);
      } catch {
        if (!cancelled) setStore(null);
      } finally {
        if (!cancelled) setStoreLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product?.storeId, sdk]);

  /** Reset transient UI state when the product changes. */
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setActiveTab('description');
    setIsWishlisted(false);
    setSelectedVariations({});
    // Pre-select first value of each variation.
    if (product?.variations && product.variations.length > 0) {
      const init: Record<string, string> = {};
      product.variations.forEach((v) => {
        if (v.values && v.values.length > 0) init[v.name] = v.values[0];
      });
      setSelectedVariations(init);
    }
  }, [product?.id]);

  const categorySlug = useMemo(() => {
    if (!product?.category) return '';
    const cat = categories.find(
      (c) => c.name?.toLowerCase() === product.category!.toLowerCase()
    );
    return cat?.slug || slugify(product.category);
  }, [product?.category, categories]);

  // Derived display values
  const images = product?.images && product.images.length > 0 ? product.images : [];
  const hasDiscount =
    !!product?.originalPrice &&
    Number(product.originalPrice) > Number(product.price) &&
    Number(product.price) > 0;
  const discountPct = hasDiscount
    ? Math.round(
        ((Number(product!.originalPrice!) - Number(product!.price)) /
          Number(product!.originalPrice!)) *
          100
      )
    : 0;
  const shownDiscount = Math.max(discountPct, Number(product?.discount || 0));
  const inventory = Number(product?.inventory || 0);
  const outOfStock = inventory <= 0;
  const lowStock = !outOfStock && inventory <= 8;
  const rating = Number(product?.rating || 0);
  const ratingInt = Math.round(rating);
  const soldCount = Number(product?.soldCount || 0);
  const fastShip = Number(product?.shippingCost || 0) === 0 && !!product?.shippingEnabled;

  const specs = useMemo(() => {
    const s = (product as any)?.specifications;
    return s && typeof s === 'object' ? (s as Record<string, string>) : {};
  }, [product]);

  /** Handlers */
  const handleAddToCart = async () => {
    if (!product) return;
    if (outOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }
    if (!currentUser) {
      toast.info('Please sign in to add items to your cart.');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      toast.success('Added to cart', {
        description: `${quantity} × ${product.name}`,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (outOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }
    if (!currentUser) {
      toast.info('Please sign in to continue to checkout.');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err: any) {
      toast.error(err?.message || 'Could not proceed to checkout.');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!currentUser) {
      toast.info('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      setWishlisting(true);
      await addToWishlist(product.id);
      setIsWishlisted(true);
      toast.success('Saved to wishlist', { description: product.name });
    } catch (err: any) {
      toast.error(err?.message || 'Could not add to wishlist.');
    } finally {
      setWishlisting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: product?.name || 'Check out this product',
      text: product?.description || '',
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied to clipboard');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const goToReviews = () => {
    setActiveTab('reviews');
    requestAnimationFrame(() => {
      document
        .getElementById('product-tabs')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /** Render: skeleton while loading */
  if (productLoading || contextLoading) {
    return (
      <Shell>
        <div className="space-y-6">
          <Skeleton className="h-5 w-72" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-9 w-44" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  /** Render: not found */
  if (!product) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t('product_not_found') || 'Product not found'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('product_not_found_desc') ||
              'The product you are looking for may have been removed or is no longer available.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('home') || 'Home'}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">{t('products') || 'Products'}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/category/${categorySlug}`}>{product.category}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1 max-w-[40vw]">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: gallery */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ImageGallery images={images} name={product.name} />
        </div>

        {/* Right: product info */}
        <div className="space-y-6">
          {/* Brand + category */}
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <Tag className="h-3 w-3" />
                {product.brand}
              </Badge>
            )}
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </Badge>
            {product.isFeatured && (
              <Badge className="gap-1 bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <Flame className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {fastShip && (
              <Badge className="gap-1 bg-primary/95 px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <Truck className="h-3 w-3" />
                Free shipping
              </Badge>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating + seller + sold count */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <button
                type="button"
                onClick={goToReviews}
                className="group inline-flex items-center gap-1.5"
                aria-label={`Rated ${rating} out of 5. View reviews.`}
              >
                <span className="flex items-center gap-0.5" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i <= ratingInt
                          ? 'fill-accent text-accent'
                          : 'fill-muted text-muted-foreground/40'
                      )}
                    />
                  ))}
                </span>
                <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground underline-offset-2 group-hover:underline">
                  ({Number(product.reviewCount || 0).toLocaleString()} reviews)
                </span>
              </button>

              <span className="h-4 w-px bg-border" aria-hidden />

              {product.sellerName && (
                <Link
                  to={store?.slug ? `/stores/${store.slug}` : '/stores'}
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Store className="h-4 w-4" />
                  <span className="font-medium text-foreground">{product.sellerName}</span>
                  {store?.isVerified && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-primary/40 bg-primary/5 px-1.5 text-[10px] font-medium text-primary"
                    >
                      <Check className="h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  )}
                </Link>
              )}

              {soldCount > 0 && (
                <>
                  <span className="h-4 w-px bg-border" aria-hidden />
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-accent" />
                    {soldCount.toLocaleString()} sold
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold leading-none text-primary sm:text-4xl">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(Number(product.originalPrice!))}
              </span>
            )}
            {shownDiscount > 0 && (
              <Badge className="bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                Save {shownDiscount}%
              </Badge>
            )}
          </div>

          {/* Short description */}
          {product.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description}
            </p>
          )}

          <Separator />

          {/* Availability + SKU + tags */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  outOfStock ? 'bg-destructive' : lowStock ? 'bg-accent' : 'bg-primary'
                )}
                aria-hidden
              />
              <span className="font-medium text-foreground">
                {outOfStock
                  ? t('out_of_stock') || 'Out of stock'
                  : lowStock
                  ? `Low stock — only ${inventory} left`
                  : 'In stock'}
              </span>
            </div>
            {product.sku && (
              <span className="text-muted-foreground">
                SKU: <span className="font-mono text-foreground">{product.sku}</span>
              </span>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Variations */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3">
              {product.variations.map((variation: ProductVariation) => (
                <div key={variation.id} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {variation.name}:{' '}
                    <span className="text-muted-foreground">
                      {selectedVariations[variation.name] || 'Select'}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variation.values.map((value) => {
                      const selected = selectedVariations[variation.name] === value;
                      return (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={selected ? 'default' : 'outline'}
                          onClick={() =>
                            setSelectedVariations((prev) => ({ ...prev, [variation.name]: value }))
                          }
                          className="h-9 px-3 text-sm"
                        >
                          {value}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity + wishlist + share */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-lg border border-border bg-background"
              role="group"
              aria-label="Quantity selector"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                aria-label="Decrease quantity"
                className="h-10 w-10 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={Math.max(1, inventory)}
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isNaN(v)) {
                    setQuantity(1);
                    return;
                  }
                  setQuantity(Math.max(1, Math.min(inventory || 1, v)));
                }}
                className="h-10 w-14 border-0 bg-transparent text-center [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Quantity"
                disabled={outOfStock}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(inventory || 1, q + 1))}
                disabled={outOfStock || quantity >= (inventory || 1)}
                aria-label="Increase quantity"
                className="h-10 w-10 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleWishlist}
              disabled={wishlisting}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="h-10 w-10 shrink-0"
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isWishlisted ? 'fill-accent text-accent' : 'text-foreground'
                )}
              />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label="Share product"
              className="h-10 w-10 shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              type="button"
              size="lg"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="h-12 w-full gap-2 text-base font-semibold shadow-sm"
            >
              {adding ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  Adding…
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  {t('add_to_cart') || 'Add to cart'}
                </>
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleBuyNow}
              disabled={outOfStock || adding}
              className="h-12 w-full gap-2 border-accent bg-accent/5 text-base font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {t('buy_now') || 'Buy now'}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <TrustBadge
              icon={<Lock className="h-5 w-5 text-primary" />}
              title="Secure payments"
              sub="Encrypted checkout"
            />
            <TrustBadge
              icon={<Truck className="h-5 w-5 text-primary" />}
              title="Fast delivery"
              sub={fastShip ? 'Free shipping' : 'Nationwide'}
            />
            <TrustBadge
              icon={<RotateCcw className="h-5 w-5 text-primary" />}
              title="Easy returns"
              sub="14-day window"
            />
          </div>
        </div>
      </div>

      {/* Seller card (only if we have a store) */}
      <div className="mt-10">
        <SellerCard store={store} loading={storeLoading} />
      </div>

      {/* Tabs */}
      <div id="product-tabs" className="mt-10 scroll-mt-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 bg-muted/50 p-1 sm:grid-cols-4">
            <TabsTrigger value="description" className="py-2.5 text-sm">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="py-2.5 text-sm">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="shipping" className="py-2.5 text-sm">
              Shipping & Returns
            </TabsTrigger>
            <TabsTrigger value="reviews" className="py-2.5 text-sm">
              Reviews ({Number(product.reviewCount || 0).toLocaleString()})
            </TabsTrigger>
          </TabsList>

          {/* Description */}
          <TabsContent value="description" className="mt-6">
            <Card className="border-border/60">
              <CardContent className="p-5 sm:p-6">
                <div className="prose prose-sm max-w-none sm:prose-base">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    About this product
                  </h3>
                  {product.description ? (
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No detailed description available for this product.
                    </p>
                  )}

                  {/* Highlights */}
                  {(product.brand || soldCount > 0 || product.isFeatured) && (
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {product.brand && (
                        <Highlight
                          icon={<Tag className="h-4 w-4" />}
                          label="Brand"
                          value={product.brand}
                        />
                      )}
                      {soldCount > 0 && (
                        <Highlight
                          icon={<Flame className="h-4 w-4" />}
                          label="Bestseller"
                          value={`${soldCount.toLocaleString()} sold`}
                        />
                      )}
                      {product.isFeatured && (
                        <Highlight
                          icon={<Star className="h-4 w-4" />}
                          label="Featured"
                          value="Editor's pick"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications */}
          <TabsContent value="specifications" className="mt-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Technical specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border/60">
                      {product.brand && (
                        <SpecRow
                          icon={<Tag className="h-3.5 w-3.5" />}
                          label="Brand"
                          value={product.brand}
                        />
                      )}
                      <SpecRow
                        icon={<Package className="h-3.5 w-3.5" />}
                        label="Category"
                        value={product.category}
                      />
                      {product.sku && (
                        <SpecRow
                          icon={<PackageCheck className="h-3.5 w-3.5" />}
                          label="SKU"
                          value={product.sku}
                          mono
                        />
                      )}
                      {Object.keys(specs).length > 0 &&
                        Object.entries(specs).map(([k, v]) => (
                          <SpecRow key={k} label={k} value={String(v)} />
                        ))}
                      {product.weight != null && (
                        <SpecRow
                          icon={<Scale className="h-3.5 w-3.5" />}
                          label="Weight"
                          value={`${product.weight} kg`}
                        />
                      )}
                      {product.dimensions && (
                        <SpecRow
                          icon={<Ruler className="h-3.5 w-3.5" />}
                          label="Dimensions"
                          value={product.dimensions}
                        />
                      )}
                      <SpecRow
                        icon={<Package className="h-3.5 w-3.5" />}
                        label="Availability"
                        value={
                          outOfStock
                            ? 'Out of stock'
                            : `${inventory} unit${inventory === 1 ? '' : 's'} in stock`
                        }
                      />
                    </tbody>
                  </table>
                </div>

                {Object.keys(specs).length === 0 && !product.brand && !product.sku && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No detailed specifications are available for this product yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping & Returns */}
          <TabsContent value="shipping" className="mt-6">
            <Card className="border-border/60">
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Shipping
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {store?.policies?.shipping ||
                      (product.shippingEnabled
                        ? `Ships nationwide. ${
                            Number(product.shippingCost || 0) === 0
                              ? 'Free shipping on this item.'
                              : `Standard shipping fee of ${formatPrice(
                                  Number(product.shippingCost || 0)
                                )} applies.`
                          }`
                        : 'This product is not eligible for direct shipping. Contact the seller for arrangements.')}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                    <RotateCcw className="h-4 w-4 text-primary" />
                    Returns & Refunds
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {store?.policies?.returns ||
                      'We accept returns within 14 days of delivery for items in their original, unused condition. Refunds are processed to your original payment method within 5-7 business days.'}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TrustBadge
                    icon={<Lock className="h-5 w-5 text-primary" />}
                    title="Buyer protection"
                    sub="Refund guaranteed"
                  />
                  <TrustBadge
                    icon={<PackageCheck className="h-5 w-5 text-primary" />}
                    title="Quality checked"
                    sub="Verified seller"
                  />
                  <TrustBadge
                    icon={<Shield className="h-5 w-5 text-primary" />}
                    title="Safe checkout"
                    sub="SSL secured"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection
              productId={product.id}
              averageRating={rating}
              reviewCount={Number(product.reviewCount || 0)}
              isLoggedIn={!!currentUser}
              fetchReviews={(pid) => sdk.getProductReviews(pid) as Promise<Review[]>}
              createReview={async (data) =>
                sdk.create('reviews', {
                  ...data,
                  productId: product.id,
                  userId: currentUser?.id,
                  userName: currentUser?.name || 'Customer',
                  isVerified: false,
                })
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      <div className="mt-12">
        <RelatedProducts
          products={products}
          currentProductId={product.id}
          category={product.category}
          categorySlug={categorySlug}
          loading={contextLoading}
          limit={8}
        />
      </div>

      {/* Mobile bottom CTA */}
      <div className="sticky bottom-0 z-30 mt-12 -mx-4 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs text-muted-foreground">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(Number(product.originalPrice!))}
                </span>
              )}
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
            className="h-11 gap-2 px-5 font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? 'Sold out' : 'Add'}
          </Button>
        </div>
      </div>
    </Shell>
  );
}

/** Layout shell with sticky footer. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto w-full flex-1 px-4 py-6 sm:py-8">{children}</main>
      <Footer />
    </div>
  );
}

function TrustBadge({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Highlight({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <tr className="bg-card hover:bg-muted/30">
      <th
        scope="row"
        className="w-1/3 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        <span className="inline-flex items-center gap-1.5">
          {icon && <span className="text-primary/70">{icon}</span>}
          {label}
        </span>
      </th>
      <td
        className={cn(
          'px-4 py-3 text-sm text-foreground',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </td>
    </tr>
  );
}
