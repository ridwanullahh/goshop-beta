import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/lib/commerce-sdk';
import { ChevronRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
}

/**
 * Category showcase: image/icon, name, link to /category/:slug.
 * Horizontal scroll on mobile, responsive grid on larger screens.
 */
export function CategoryGrid({ categories, isLoading = false }: CategoryGridProps) {
  return (
    <section aria-labelledby="categories-heading" className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="categories-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Shop by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find exactly what you need across our curated departments.
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            All categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <CategoryGridSkeleton />
        ) : categories.length === 0 ? (
          <EmptyState />
        ) : (
          <ul
            className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:overflow-visible"
            aria-label="Categories"
          >
            {categories.map((cat) => (
              <li key={cat.id} className="min-w-[140px] sm:min-w-0">
                <Link
                  to={`/category/${encodeURIComponent(cat.slug)}`}
                  className="group flex h-full flex-col items-center justify-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15 text-lg font-bold uppercase text-primary">
                        {cat.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 sm:hidden">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            All categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">No categories yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Categories will appear here once they are added to the catalog.
      </p>
    </div>
  );
}

export default CategoryGrid;
