
import React from 'react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from './ProductGrid';
import { useCommerce } from '@/context/CommerceContext';
import { TrendingUp, Flame, Star } from 'lucide-react';

export function FeaturedSection() {
  const { products } = useCommerce();

  const featuredProducts = products.filter(p => p.featured || p.isFeatured).slice(0, 8);
  const trendingProducts = products.filter(p => p.rating >= 4.5).slice(0, 4);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Featured Products */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-commerce rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked favorites from our community</p>
              </div>
            </div>
            <Button variant="outline" className="hidden sm:flex">
              View All Featured
            </Button>
          </div>
          
          <ProductGrid products={featuredProducts} />
        </div>

        {/* Trending Now */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Trending Now</h2>
                <p className="text-muted-foreground">What everyone's talking about</p>
              </div>
            </div>
            <Button variant="outline" className="hidden sm:flex">
              See All Trends
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product, index) => (
              <div key={product.id} className="relative group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    #{index + 1}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 hover:shadow-card transition-all duration-300">
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">${product.price}</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-secondary text-secondary" />
                      <span className="text-xs ml-1">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Deals Banner */}
        <div className="bg-gradient-commerce rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-8 h-8 mr-2" />
              <h2 className="text-3xl font-bold">Hot Deals</h2>
            </div>
            <p className="text-xl mb-6 opacity-90">
              Limited time offers - Up to 70% off on selected items
            </p>
            <Button size="xl" variant="secondary" className="shadow-lg">
              Shop Deals Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
