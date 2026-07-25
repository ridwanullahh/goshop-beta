import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommerce } from '@/context/CommerceContext';
import { ChevronRight, CalendarDays, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  author?: string;
  storeName?: string;
  category?: string;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * "From our blog" — latest 3 blogs (fetched via sdk.getBlogs).
 */
export function BlogSection() {
  const { sdk } = useCommerce();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = (await sdk.getBlogs()) as BlogPost[];
        if (!alive) return;
        const published = (data || []).filter(
          (p) => (p as any).isPublished !== false
        );
        // newest first; fall back to updatedAt if createdAt missing.
        published.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt || 0).getTime() -
            new Date(a.createdAt || a.updatedAt || 0).getTime()
        );
        setPosts(published.slice(0, 3));
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sdk]);

  return (
    <section
      aria-labelledby="blog-heading"
      className="border-t bg-muted/30 py-12 sm:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="blog-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              From our blog
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guides, stories, and marketplace news.
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            All articles <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <BlogSkeleton />
        ) : error || posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No articles yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Marketplace stories and guides will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const date = post.createdAt || post.updatedAt;
  const excerpt =
    post.excerpt ||
    (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 160) : '');

  return (
    <Link
      to={`/blog/${encodeURIComponent(post.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, hsl(158 64% 40% / 0.25), hsl(32 95% 50% / 0.25))',
            }}
          />
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary backdrop-blur">
            {post.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-muted-foreground">
          {(post.author || post.storeName) && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author || post.storeName}
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-72 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default BlogSection;
