import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Store } from '@/lib/commerce-sdk';
import {
  BadgeCheck,
  MapPin,
  Package,
  ChevronRight,
  Store as StoreIcon,
} from 'lucide-react';
import { StoreRating } from './StoreRating';

export interface StoreCardProps {
  store: Store;
  className?: string;
  /** Hide the "Visit store" CTA row at the bottom (used in dense rails). */
  hideCta?: boolean;
}

/**
 * Premium, fully-linkable store card.
 *
 * The whole card is a semantic anchor to /stores/:slug. Banner image with
 * overlay, overlapping circular logo, verified badge, name, rating, product
 * count, location and a short 2-line clamped description. Hover-lift, focus
 * ring, keyboard accessible. No emoji icons, no indigo/blue.
 */
export function StoreCard({ store, className = '', hideCta = false }: StoreCardProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const rating = Number(store.rating || 0);
  const reviewCount = Number(store.reviewCount || 0);
  const productCount = Number(store.productCount || 0);
  const verified = Boolean(store.isVerified || store.isApproved);

  const href = `/stores/${encodeURIComponent(store.slug)}`;
  const initial = (store.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <Link
      to={href}
      aria-label={`Visit ${store.name} store`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {store.banner && !bannerError ? (
          <img
            src={store.banner}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setBannerError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
        {/* Soft overlay so badges and logo read clearly. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        {/* Verified badge (top-right) */}
        {verified && (
          <Badge
            className="absolute right-3 top-3 gap-1 border-0 bg-primary/95 text-primary-foreground shadow-sm backdrop-blur"
            title="Verified seller"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </Badge>
        )}

        {/* Business type chip (top-left) */}
        {store.businessType && (
          <Badge
            variant="outline"
            className="absolute left-3 top-3 border-white/30 bg-black/35 text-white backdrop-blur"
          >
            {store.businessType}
          </Badge>
        )}
      </div>

      {/* Logo + body */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-3">
        {/* Overlapping logo */}
        <div className="-mt-12 mb-2 flex items-end justify-between">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md">
            {store.logo && !logoError ? (
              <img
                src={store.logo}
                alt={`${store.name} logo`}
                loading="lazy"
                onError={() => setLogoError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold text-primary">
                {initial}
              </div>
            )}
          </div>
          {rating > 0 && (
            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300">
              <StoreRating rating={rating} reviewCount={reviewCount} size={12} />
            </div>
          )}
        </div>

        {/* Name */}
        <h3
          className="line-clamp-1 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary"
          title={store.name}
        >
          {store.name}
        </h3>

        {/* Description */}
        {store.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {store.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {productCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {productCount.toLocaleString()} products
            </span>
          )}
          {store.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-[10rem] truncate">{store.location}</span>
            </span>
          )}
          {store.established && (
            <span className="inline-flex items-center gap-1">
              <StoreIcon className="h-3.5 w-3.5" />
              Est. {store.established}
            </span>
          )}
        </div>

        {/* CTA */}
        {!hideCta && (
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Visit store
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/** Skeleton placeholder for StoreCard while data is loading. */
export function StoreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="px-5 pb-5 pt-3">
        <Skeleton className="-mt-12 mb-3 h-16 w-16 rounded-2xl border-4 border-card" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="mt-3 flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="mt-4 h-4 w-24" />
      </div>
    </div>
  );
}

export default StoreCard;
