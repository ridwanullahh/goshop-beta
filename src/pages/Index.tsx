import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommerce } from '@/context/CommerceContext';
import {
  Hero,
  CategoryGrid,
  DealsSection,
  FeaturedProducts,
  BestSellers,
  TopStores,
  ValueProps,
  BlogSection,
  Newsletter,
} from '@/components/home';

/**
 * Public marketplace homepage.
 *
 * Sections:
 *  1. Hero (emerald/charcoal gradient, search, CTAs, trust badges)
 *  2. Category showcase (image/icon, name, /category/:slug)
 *  3. Flash Deals (products with discount > 0, ribbon)
 *  4. Featured products (isFeatured, /products?featured=true)
 *  5. Best sellers (sorted by soldCount desc, top 8)
 *  6. Top stores (verified, /stores/:slug)
 *  7. Value propositions (4 Lucide icons)
 *  8. From our blog (sdk.getBlogs, /blog/:slug)
 *  9. Newsletter / CTA banner (emerald/amber, sonner toast)
 *
 * Layout: min-h-screen flex flex-col, footer sticks to bottom (mt-auto).
 * All data is bound via useCommerce() / sdk — NO mocks/dummies.
 */
const Index: React.FC = () => {
  const { products, categories, isLoading } = useCommerce();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* 1. Hero */}
        <Hero />

        {/* Loading strip — only shows while categories are still loading AND we have no data yet */}
        {isLoading && categories.length === 0 && <HomepageSkeleton />}

        {/* 2. Category showcase */}
        <CategoryGrid categories={categories} isLoading={isLoading && categories.length === 0} />

        {/* 3. Flash Deals */}
        <DealsSection products={products} isLoading={isLoading && products.length === 0} />

        {/* 4. Featured products */}
        <FeaturedProducts products={products} isLoading={isLoading && products.length === 0} />

        {/* 5. Best sellers */}
        <BestSellers products={products} isLoading={isLoading && products.length === 0} />

        {/* 6. Top stores */}
        <TopStores />

        {/* 7. Value props */}
        <ValueProps />

        {/* 8. From our blog */}
        <BlogSection />

        {/* 9. Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
};

/** Lightweight full-width skeleton shown only on the very first paint when no data is available. */
function HomepageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10" aria-hidden>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default Index;
