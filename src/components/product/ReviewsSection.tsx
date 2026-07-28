import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Star, MessageCircle, BadgeCheck, Loader2, PenLine } from 'lucide-react';

export interface Review {
  id: string;
  productId?: string;
  userId?: string;
  userName?: string;
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
  isVerified?: boolean;
  createdAt?: string;
}

export interface ReviewsSectionProps {
  productId: string;
  /** Average rating shown in the summary (typically the product.rating). */
  averageRating: number;
  /** Total review count shown in the summary (typically product.reviewCount). */
  reviewCount: number;
  /** Whether a user is signed in (controls write-review CTA). */
  isLoggedIn: boolean;
  /** Function to fetch reviews for the product. Returns an array. */
  fetchReviews: (productId: string) => Promise<Review[]>;
  /** Function to create a review. */
  createReview: (data: {
    productId: string;
    rating: number;
    title: string;
    content: string;
  }) => Promise<unknown>;
  /** Optional ref handle to scroll this section into view. */
  sectionId?: string;
}

/**
 * Premium reviews section.
 *
 * - Summary block: big average, star bar, distribution histogram.
 * - List: avatar (initials fallback), name, verified badge, stars, title, content,
 *   date, optional review images.
 * - Auth-gated "Write a review" form (rating, title, content) that posts via sdk.create.
 * - Friendly empty state when no reviews exist.
 */
export function ReviewsSection({
  productId,
  averageRating,
  reviewCount,
  isLoggedIn,
  fetchReviews,
  createReview,
  sectionId = 'reviews',
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silent — we still render the empty state.
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [fetchReviews, productId]);

  useEffect(() => {
    load();
  }, [load]);

  // Distribution of ratings (5..1).
  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // index 0 = 1 star, 4 = 5 stars
    reviews.forEach((r) => {
      const v = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
      buckets[v - 1] += 1;
    });
    const total = reviews.length || 1;
    return buckets
      .map((count, i) => ({
        stars: i + 1,
        count,
        pct: (count / total) * 100,
      }))
      .reverse(); // 5-star first
  }, [reviews]);

  const computedAverage = useMemo(() => {
    if (reviews.length === 0) return Number(averageRating) || 0;
    const sum = reviews.reduce(
      (acc, r) => acc + (Number(r.rating) || 0),
      0
    );
    return sum / reviews.length;
  }, [reviews, averageRating]);

  const computedCount = reviews.length || Number(reviewCount) || 0;
  const avgInt = Math.round(computedAverage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Please sign in to write a review.');
      return;
    }
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Please add a title and your review.');
      return;
    }
    try {
      setSubmitting(true);
      await createReview({
        productId,
        rating: formRating,
        title: formTitle.trim(),
        content: formContent.trim(),
      });
      toast.success('Review submitted. Thank you!');
      setFormTitle('');
      setFormContent('');
      setFormRating(5);
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id={sectionId} className="scroll-mt-24 space-y-6">
      {/* Summary */}
      <Card className="overflow-hidden border-border/70">
        <CardContent className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
          {/* Big score */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/40 p-5 text-center">
            <div className="text-4xl font-bold leading-none text-foreground">
              {computedAverage.toFixed(1)}
            </div>
            <div className="mt-2 flex items-center gap-0.5" aria-label={`Rated ${computedAverage.toFixed(1)} out of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i <= avgInt
                      ? 'fill-accent text-accent'
                      : 'fill-muted text-muted-foreground/40'
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {computedCount.toLocaleString()} review{computedCount === 1 ? '' : 's'}
            </p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {distribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="inline-flex w-12 items-center gap-1 text-muted-foreground">
                  {row.stars} <Star className="h-3 w-3 fill-accent text-accent" />
                </span>
                <Progress
                  value={row.pct}
                  className="h-2 flex-1 bg-muted"
                  aria-label={`${row.stars} star: ${row.count} reviews`}
                />
                <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                  {row.count}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Based on verified customer feedback
              </p>
              {isLoggedIn ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm((v) => !v)}
                  className="gap-1.5"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  {showForm ? 'Cancel' : 'Write a review'}
                </Button>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Sign in to review
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write form */}
      {showForm && isLoggedIn && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Share your thoughts</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Your rating</Label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormRating(i)}
                      aria-label={`Rate ${i} out of 5`}
                      className="rounded p-0.5 transition hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          i <= formRating
                            ? 'fill-accent text-accent'
                            : 'fill-muted text-muted-foreground/40'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-foreground">
                    {formRating} / 5
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-title">Title</Label>
                <Input
                  id="review-title"
                  placeholder="Summarize your experience"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-content">Review</Label>
                <Textarea
                  id="review-content"
                  placeholder="What did you like or dislike? How was the quality and value?"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit review'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-base font-semibold text-foreground">No reviews yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Be the first to share your experience with this product and help other
              shoppers make informed decisions.
            </p>
            {isLoggedIn && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-1.5"
                onClick={() => setShowForm(true)}
              >
                <PenLine className="h-4 w-4" />
                Write the first review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const name = r.userName || 'Verified Customer';
            const initials = name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
            const date = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null;
            return (
              <Card key={r.id} className="border-border/60">
                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src="" alt={name} />
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">{name}</p>
                          {r.isVerified && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-primary/40 bg-primary/5 px-1.5 text-[10px] font-medium text-primary"
                            >
                              <BadgeCheck className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        {date && (
                          <p className="text-xs text-muted-foreground">{date}</p>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`Rated ${rating} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3.5 w-3.5',
                            i <= rating
                              ? 'fill-accent text-accent'
                              : 'fill-muted text-muted-foreground/40'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {r.title && (
                    <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                  )}
                  {r.content && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {r.content}
                    </p>
                  )}

                  {r.images && r.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {r.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${name}'s photo ${i + 1}`}
                          className="h-16 w-16 rounded-md border object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ReviewsSection;
