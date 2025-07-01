
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Zap, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-subtle overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-gradient-commerce text-primary-foreground px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            100x Better Commerce Experience
          </Badge>
          
          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            The Future of
            <span className="bg-gradient-commerce bg-clip-text text-transparent block">
              Social Commerce
            </span>
          </h1>
          
          {/* Hero Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover, shop, and sell in the world's most immersive commerce platform. 
            AI-powered recommendations, live shopping, and community-driven experiences.
          </p>
          
          {/* Hero Search */}
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, brands, or experiences..."
                className="pl-12 pr-4 h-14 text-lg rounded-full border-2 bg-background/50 backdrop-blur-sm"
              />
              <Link to="/products">
                <Button
                  size="lg"
                  variant="commerce"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-8"
                >
                  Explore
                </Button>
              </Link>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/products">
              <Button size="xl" variant="commerce" className="px-12">
                Start Shopping
              </Button>
            </Link>
            <Link to="/register">
              <Button size="xl" variant="seller" className="px-12">
                Become a Seller
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-primary">10M+</span>
              </div>
              <p className="text-muted-foreground">Active Shoppers</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-secondary mr-2" />
                <span className="text-3xl font-bold text-secondary">1M+</span>
              </div>
              <p className="text-muted-foreground">Products Listed</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-8 h-8 text-primary mr-2" />
                <span className="text-3xl font-bold text-primary">24h</span>
              </div>
              <p className="text-muted-foreground">Delivery Promise</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
