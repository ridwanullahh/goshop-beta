import { Star } from 'lucide-react';

interface StoreRatingProps {
  rating: number;
  reviewCount?: number;
  /** Size of the star icon in pixels (default 14). */
  size?: number;
  /** Show the numeric rating + review count text after the stars. */
  showCount?: boolean;
  className?: string;
}

/**
 * Compact star rating used across store surfaces.
 * Uses the project amber accent for filled stars (no indigo/blue, no emoji).
 */
export function StoreRating({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
  className = '',
}: StoreRatingProps) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const ratingInt = Math.round(safeRating);
  const safeReviews = Number(reviewCount || 0);

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label={`Rated ${safeRating.toFixed(1)} out of 5${
        showCount ? ` from ${safeReviews} reviews` : ''
      }`}
    >
      <span className="inline-flex items-center" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ height: size, width: size }}
            className={
              i <= ratingInt
                ? 'fill-accent text-accent'
                : 'fill-muted text-muted-foreground/40'
            }
          />
        ))}
      </span>
      {showCount && (
        <span className="text-xs font-medium text-foreground">
          {safeRating.toFixed(1)}
          <span className="ml-1 text-muted-foreground">
            ({safeReviews.toLocaleString()})
          </span>
        </span>
      )}
    </span>
  );
}

export default StoreRating;
