import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommerce } from '@/context/CommerceContext';
import { Product } from '@/lib/commerce-sdk';
import { Star, Heart, ShoppingCart, CheckCircle2, Truck, Flame } from 'lucide-react';
import { toast } from 'sonner';

export interface ProductCardProps {
  product: Product;
  className?: string;
  /** Override the default add-to-cart handler (still falls back to sdk.addToCart). */
  onAddToCart?: (product: Product) => void | Promise<void>;
  /** Override the default wishlist handler (still falls back to sdk.addToWishlist). */
  onWishlist?: (product: Product) => void | Promise<void>;
  /** Show a compact (denser) layout — used in horizontal rails. */
  compact?: boolean;
  /** Hide the per-card CTA strip (useful inside carousels). */
  hideActions?: boolean;
}

/**
 * Reusable, world-class product card.
 *
 * - Whole card is a semantic link to `/product/:id`.
 * - Wishlist (top-right) + Add to cart buttons call out to sdk via context.
 * - Discount badge (top-left, amber), stock state, fast-shipping hint.
 * - Accessible: alt text, aria labels, keyboard focus rings, stopPropagation
 *   on action buttons so they don't trigger the card link.
 */
export function ProductCard({
  product,
  className,
  onAddToCart,
  onWishlist,
  compact = false,
  hideActions = false,
}: ProductCardProps) {
  const { currency, sdk, currentUser } = useCommerce();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  const image = !imgError && product.images?.[0] ? product.images[0] : '/placeholder.svg';
  const hasDiscount =
    !!product.originalPrice &&
    Number(product.originalPrice) > Number(product.price) &&
    Number(product.price) > 0;
  const discountPct = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice!) - Number(product.price)) /
          Number(product.originalPrice!)) *
          100
      )
    : 0;

  // discount field on the model is sometimes present; trust computed pct for accuracy.
  const shownDiscount = Math.max(discountPct, Number(product.discount || 0));
  const outOfStock = Number(product.inventory) <= 0;
  const lowStock =
    !outOfStock && Number(product.inventory) > 0 && Number(product.inventory) <= 8;
  const rating = Number(product.rating || 0);
  const ratingInt = Math.round(rating);
  const fastShip = Number(product.shippingCost || 0) === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }
    if (onAddToCart) {
      await onAddToCart(product);
      return;
    }
    if (!currentUser) {
      toast.info('Please sign in to add items to your cart.');
      return;
    }
    try {
      setAdding(true);
      await sdk.addToCart(product.id, 1);
      toast.success('Added to cart', {
        description: product.name,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlist) {
      await onWishlist(product);
      return;
    }
    if (!currentUser) {
      toast.info('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      setWishlisting(true);
      await sdk.addToWishlist(product.id);
      setIsWishlisted(true);
      toast.success('Saved to wishlist', { description: product.name });
    } catch (err: any) {
      toast.error(err?.message || 'Could not add to wishlist.');
    } finally {
      setWishlisting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    // Allow inner buttons to be reachable via keyboard; card activation only on Enter when focused without target.
    if (e.key === 'Enter' && !(e.target as HTMLElement).closest('button')) {
      // default anchor behaviour handles navigation
    }
  };

  return (
    <Card
      className={`group relative h-full w-full overflow-hidden border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
        className || ''
      }`}
    >
      <Link
        to={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
        onKeyDown={handleKeyDown}
        className="flex h-full flex-col"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={image}
            alt={product.name || 'Product image'}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Top-left badges */}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
            {shownDiscount > 0 && (
              <Badge
                className="bg-accent text-accent-foreground shadow-sm"
                title={`${shownDiscount}% off`}
              >
                -{shownDiscount}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-primary text-primary-foreground shadow-sm">
                Featured
              </Badge>
            )}
          </div>

          {/* Top-right wishlist */}
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={isWishlisted}
              disabled={wishlisting}
              onClick={handleWishlist}
              className="h-9 w-9 rounded-full border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background hover:text-accent disabled:opacity-60"
            >
              <Heart
                className={`h-4 w-4 ${
                  isWishlisted ? 'fill-accent text-accent' : 'text-foreground'
                }`}
              />
            </Button>
          </div>

          {/* Stock + shipping chips */}
          <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5">
            {outOfStock ? (
              <Badge
                variant="destructive"
                className="bg-foreground/85 text-background backdrop-blur"
              >
                Out of stock
              </Badge>
            ) : (
              <>
                {lowStock && (
                  <Badge className="bg-amber-500 text-white shadow-sm">
                    Only {product.inventory} left
                  </Badge>
                )}
                {fastShip && (
                  <Badge className="bg-primary/95 text-primary-foreground shadow-sm">
                    <Truck className="mr-1 h-3 w-3" /> Free ship
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            {product.category ? (
              <Badge variant="outline" className="px-2 py-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {product.category}
              </Badge>
            ) : (
              <span />
            )}
            {product.soldCount && Number(product.soldCount) > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Flame className="h-3 w-3 text-accent" />
                {Number(product.soldCount).toLocaleString()} sold
              </span>
            )}
          </div>

          <h3
            className={`line-clamp-2 font-medium leading-snug text-foreground transition-colors group-hover:text-primary ${
              compact ? 'text-sm' : 'text-sm sm:text-[15px]'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center" aria-label={`Rated ${rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i <= ratingInt
                      ? 'fill-accent text-accent'
                      : 'fill-muted text-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({Number(product.reviewCount || 0).toLocaleString()})
            </span>
          </div>

          {/* Seller */}
          {product.sellerName && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground">
              by <span className="font-medium text-foreground/80">{product.sellerName}</span>
            </p>
          )}

          {/* Price */}
          <div className="mt-auto flex items-end gap-2 pt-1">
            <span className="text-lg font-bold leading-none text-primary sm:text-xl">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* CTA */}
          {!hideActions && (
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="mt-2 h-9 w-full gap-2 text-sm font-semibold shadow-sm"
              variant={outOfStock ? 'outline' : 'default'}
              aria-label={`Add ${product.name} to cart`}
            >
              {adding ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  Adding…
                </>
              ) : outOfStock ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Out of stock
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </>
              )}
            </Button>
          )}
        </div>
      </Link>
    </Card>
  );
}

/** Skeleton placeholder used while data is loading. */
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/70">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

export default ProductCard;
