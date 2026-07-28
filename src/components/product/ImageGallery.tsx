import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface ImageGalleryProps {
  images: string[];
  name: string;
  loading?: boolean;
}

/**
 * Premium product image gallery.
 *
 * - Large square main image with object-cover.
 * - Thumbnail strip below (hidden when only one image is available).
 * - Hover-to-zoom on desktop (CSS transform, no JS math) with a visible affordance.
 * - Keyboard-accessible: thumbnails are buttons, arrow keys move selection.
 * - Graceful image fallback to /placeholder.svg on error.
 */
export function ImageGallery({ images, name, loading = false }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const [zoom, setZoom] = useState(false);
  const zoomRef = useRef<HTMLDivElement | null>(null);

  // Reset selection when the image set changes (e.g. navigating between products).
  useEffect(() => {
    setActiveIndex(0);
    setImgError({});
    setZoom(false);
  }, [images]);

  const safeImages = images && images.length > 0 ? images : ['/placeholder.svg'];
  const hasThumbs = safeImages.length > 1;
  const currentSrc =
    imgError[activeIndex] || !safeImages[activeIndex]
      ? '/placeholder.svg'
      : safeImages[activeIndex];

  const go = (next: number) => {
    const len = safeImages.length;
    if (len === 0) return;
    setActiveIndex(((next % len) + len) % len);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(activeIndex + 1);
    if (e.key === 'ArrowLeft') go(activeIndex - 1);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm"
        ref={zoomRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          if (!zoomRef.current) return;
          const r = zoomRef.current.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          zoomRef.current.style.setProperty('--zoom-x', `${x}%`);
          zoomRef.current.style.setProperty('--zoom-y', `${y}%`);
        }}
      >
        <img
          src={currentSrc}
          alt={`${name} — image ${activeIndex + 1}`}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 ease-out',
            zoom ? 'scale-150' : 'scale-100'
          )}
          style={
            zoom
              ? ({ transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)' } as React.CSSProperties)
              : undefined
          }
          onError={() =>
            setImgError((prev) => ({ ...prev, [activeIndex]: true }))
          }
          loading="eager"
        />

        {/* Zoom affordance */}
        <div className="pointer-events-none absolute right-3 top-3 hidden items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 sm:flex">
          <ZoomIn className="h-3.5 w-3.5" />
          Hover to zoom
        </div>

        {/* Prev / next controls (only when multiple images) */}
        {hasThumbs && (
          <>
            <button
              type="button"
              onClick={() => go(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/85 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(activeIndex + 1)}
              disabled={activeIndex === safeImages.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/85 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background disabled:opacity-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasThumbs && (
          <div className="absolute bottom-3 right-3 rounded-full bg-foreground/75 px-2.5 py-0.5 text-xs font-medium text-background backdrop-blur">
            {activeIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasThumbs && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product image thumbnails"
          onKeyDown={onKeyDown}
        >
          {safeImages.map((img, i) => {
            const isActive = i === activeIndex;
            const errored = imgError[i];
            return (
              <button
                key={`${img}-${i}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all',
                  isActive
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border/60 hover:border-primary/40'
                )}
              >
                <img
                  src={errored ? '/placeholder.svg' : img}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
