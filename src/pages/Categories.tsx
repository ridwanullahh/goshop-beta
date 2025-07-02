
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, ArrowRight } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

export default function Categories() {
  const { sdk } = useCommerce();
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      if (!sdk) return;
      
      try {
        const data = await sdk.getCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback categories
        const fallbackCategories = [
          { id: '1', name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech accessories', productCount: 1250 },
          { id: '2', name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', productCount: 2100 },
          { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home decor, furniture, and garden supplies', productCount: 850 },
          { id: '4', name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Fitness equipment and outdoor gear', productCount: 670 },
          { id: '5', name: 'Books & Media', slug: 'books-media', description: 'Books, movies, music, and games', productCount: 980 },
          { id: '6', name: 'Beauty & Personal Care', slug: 'beauty', description: 'Cosmetics, skincare, and personal care', productCount: 1340 }
        ];
        setCategories(fallbackCategories);
        setFilteredCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [sdk]);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover products organized by categories that matter to you
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category.id} to={`/categories/${category.slug}`}>
                <Card className="group overflow-hidden hover:shadow-card transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <Grid3X3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {category.productCount || 0} products
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        Browse Category
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Grid3X3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all categories
            </p>
          </div>
        )}

        {/* Featured Categories */}
        {!searchQuery && categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} to={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-card transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Grid3X3 className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
