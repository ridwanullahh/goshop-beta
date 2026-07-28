import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Store } from '@/lib/commerce-sdk';
import {
  BadgeCheck,
  ChevronRight,
  Home,
  MapPin,
  Package,
  Share2,
  Store as StoreIcon,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { StoreRating } from './StoreRating';
import { toast } from 'sonner';

export interface StoreHeroProps {
  store: Store;
  /** Total products actually loaded for the store (used for the stat). */
  productCount?: number;
}

/**
 * Premium storefront hero.
 *
 * Full-width banner with overlay, large overlapping circular logo, store name,
 * verified badge, rating + review count, location, established year, business
 * type, breadcrumb (Home / Stores / name), Follow + Share actions.
 */
export function StoreHero({ store, productCount }: StoreHeroProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [following, setFollowing] = useState(false);

  const rating = Number(store.rating || 0);
  const reviewCount = Number(store.reviewCount || 0);
  const verified = Boolean(store.isVerified || store.isApproved);
  const initial = (store.name || 'S').trim().charAt(0).toUpperCase();
  const products = Number.isFinite(productCount as number) ? Number(productCount) : Number(store.productCount || 0);

  const handleFollow = () => {
    setFollowing((prev) => !prev);
    if (!following) {
      toast.success(`Following ${store.name}`, {
        description: 'You will see updates from this store in your feed.',
      });
    } else {
      toast.info(`Unfollowed ${store.name}`);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({
          title: store.name,
          text: store.description || `Check out ${store.name} on GoShop`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Store link copied to clipboard');
    } catch {
      // user cancelled share / clipboard blocked — silent
    }
  };

  return (
    <header className="relative">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64 lg:h-80">
        {store.banner && !bannerError ? (
          <img
            src={store.banner}
            alt=""
            aria-hidden
            onError={() => setBannerError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, hsl(158 64% 40% / 0.9), hsl(32 95% 50% / 0.9))',
            }}
          />
        )}
        {/* Multi-stop overlay for legibility. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
      </div>

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="-mt-3 mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            to="/stores"
            className="transition-colors hover:text-primary"
          >
            Stores
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 font-medium text-foreground" aria-current="page">
            {store.name}
          </span>
        </nav>

        {/* Identity row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Logo */}
            <div className="-mt-16 h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-background bg-muted shadow-lg sm:-mt-20 sm:h-28 sm:w-28">
              {store.logo && !logoError ? (
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-3xl font-bold text-primary">
                  {initial}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {store.name}
                </h1>
                {verified && (
                  <Badge
                    className="gap-1 bg-primary text-primary-foreground"
                    title="Verified seller"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {rating > 0 && (
                  <StoreRating rating={rating} reviewCount={reviewCount} />
                )}
                {products > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {products.toLocaleString()} products
                  </span>
                )}
                {store.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {store.location}
                  </span>
                )}
                {store.established && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Est. {store.established}
                  </span>
                )}
                {store.businessType && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {store.businessType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 pb-1">
            <Button
              type="button"
              variant={following ? 'outline' : 'default'}
              onClick={handleFollow}
              aria-pressed={following}
              className="gap-2"
            >
              <StoreIcon className="h-4 w-4" />
              {following ? 'Following' : 'Follow store'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleShare}
              aria-label={`Share ${store.name} store`}
              title="Share store"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Loading skeleton mirroring StoreHero. */
export function StoreHeroSkeleton() {
  return (
    <header className="relative">
      <Skeleton className="h-48 w-full rounded-none sm:h-64 lg:h-80" />
      <div className="container mx-auto px-4">
        <div className="mt-3 mb-4 flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Skeleton className="-mt-16 h-24 w-24 rounded-3xl border-4 border-background sm:-mt-20 sm:h-28 sm:w-28" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default StoreHero;
