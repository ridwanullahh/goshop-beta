import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ShoppingBag,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/**
 * Premium hero with a refined emerald/charcoal gradient (NO indigo/blue).
 * - Prominent search bar (navigates to /search?q=...).
 * - Primary CTA "Start Shopping" -> /products.
 * - Secondary CTA "Become a Seller" -> /signup.
 * - Trust badges row (secure payments, fast delivery, verified sellers, easy returns).
 */
export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/products');
  };

  const trustBadges = [
    { icon: ShieldCheck, label: 'Secure payments' },
    { icon: Truck, label: 'Fast delivery' },
    { icon: Store, label: 'Verified sellers' },
    { icon: RotateCcw, label: 'Easy returns' },
  ];

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 500px at 80% -10%, hsl(32 95% 50% / 0.18), transparent 60%), radial-gradient(900px 600px at 0% 10%, hsl(158 64% 40% / 0.30), transparent 55%), linear-gradient(135deg, hsl(160 50% 12%), hsl(158 60% 18%) 45%, hsl(170 40% 10%))',
      }}
      aria-label="Hero"
    >
      {/* Subtle dot pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="container relative mx-auto px-4 py-14 sm:py-20 lg:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-50 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            The trusted marketplace for buyers &amp; sellers
          </span>

          <h1 className="mt-5 text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Shop the world.{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Sell to anyone.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-base text-emerald-50/85 sm:text-lg">
            Discover millions of products from verified sellers, with secure
            payments, fast delivery, and easy returns — all in one premium
            marketplace.
          </p>

          {/* Search */}
          <form
            onSubmit={submitSearch}
            className="mt-7 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row"
            role="search"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories…"
                aria-label="Search products"
                className="h-14 rounded-full border-0 bg-white pl-12 pr-4 text-base shadow-lg ring-1 ring-black/5 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-full px-8 text-base font-semibold shadow-lg sm:w-auto"
            >
              <Search className="h-5 w-5" />
              Search
            </Button>
          </form>

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold shadow-md">
              <Link to="/products">
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <Link to="/signup">
                <Store className="h-5 w-5" />
                Become a Seller
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <ul className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {trustBadges.map((b) => (
              <li
                key={b.label}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-emerald-50 backdrop-blur"
              >
                <b.icon className="h-4 w-4 text-amber-300" />
                {b.label}
              </li>
            ))}
          </ul>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-emerald-50/75">
            <span>Popular:</span>
            {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((t) => (
              <Link
                key={t}
                to={`/search?q=${encodeURIComponent(t)}`}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white"
              >
                {t}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
